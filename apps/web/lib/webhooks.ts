import { createHmac } from "crypto";
import { db, webhookEndpoints, webhookDeliveries } from "@prefskit/db";
import { eq, and, inArray } from "@prefskit/db";

export type WebhookEvent =
  | "subscriber.suppressed"
  | "subscriber.preference_updated"
  | "subscriber.restored";

export interface WebhookPayload {
  event: WebhookEvent;
  data: Record<string, unknown>;
  timestamp: string;
}

/**
 * Sign a webhook payload with HMAC-SHA256
 */
export function signWebhookPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Deliver a webhook event to all registered endpoints for a workspace
 * (Pro plan only — enforced at call site)
 */
export async function deliverWebhookEvent(
  workspaceId: string,
  event: WebhookEvent,
  data: Record<string, unknown>,
): Promise<void> {
  const endpoints = await db.query.webhookEndpoints.findMany({
    where: and(
      eq(webhookEndpoints.workspaceId, workspaceId),
    ),
  });

  // Filter endpoints that subscribe to this event
  const applicable = endpoints.filter(
    (ep) => ep.events.length === 0 || ep.events.includes(event),
  );

  if (applicable.length === 0) return;

  const payload: WebhookPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };
  const payloadStr = JSON.stringify(payload);

  // Create delivery records and dispatch
  for (const endpoint of applicable) {
    // Insert delivery record
    const [delivery] = await db
      .insert(webhookDeliveries)
      .values({
        endpointId: endpoint.id,
        event,
        payload,
        status: "pending",
        attempts: 0,
      })
      .returning();

    if (!delivery) continue;

    // Dispatch async (fire and forget with retry)
    dispatchWithRetry(delivery.id, endpoint.url, endpoint.secret, payloadStr).catch(
      console.error,
    );
  }
}

const RETRY_DELAYS = [60_000, 300_000, 1_800_000]; // 1min, 5min, 30min

async function dispatchWithRetry(
  deliveryId: string,
  url: string,
  secret: string,
  payloadStr: string,
  attempt = 0,
): Promise<void> {
  const signature = signWebhookPayload(payloadStr, secret);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PrefsKit-Signature": `sha256=${signature}`,
        "X-PrefsKit-Attempt": String(attempt + 1),
      },
      body: payloadStr,
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok) {
      await db
        .update(webhookDeliveries)
        .set({
          status: "success",
          attempts: attempt + 1,
          nextRetryAt: null,
        })
        .where(eq(webhookDeliveries.id, deliveryId));
      return;
    }

    throw new Error(`HTTP ${response.status}`);
  } catch (err) {
    const nextAttempt = attempt + 1;

    if (nextAttempt >= 3) {
      // Mark as failed
      await db
        .update(webhookDeliveries)
        .set({
          status: "failed",
          attempts: nextAttempt,
          nextRetryAt: null,
        })
        .where(eq(webhookDeliveries.id, deliveryId));
      return;
    }

    const delay = RETRY_DELAYS[attempt] ?? 60_000;
    const nextRetryAt = new Date(Date.now() + delay);

    await db
      .update(webhookDeliveries)
      .set({
        status: "retrying",
        attempts: nextAttempt,
        nextRetryAt,
      })
      .where(eq(webhookDeliveries.id, deliveryId));

    // Schedule retry
    setTimeout(
      () =>
        dispatchWithRetry(
          deliveryId,
          url,
          secret,
          payloadStr,
          nextAttempt,
        ).catch(console.error),
      delay,
    );
  }
}
