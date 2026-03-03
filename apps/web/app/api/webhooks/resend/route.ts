import { type NextRequest, NextResponse } from "next/server";
import { db, suppressions, workspaces } from "@prefskit/db";
import { eq, and } from "@prefskit/db";
import { deliverWebhookEvent } from "@/lib/webhooks";

/**
 * Resend webhook handler — auto-suppress on bounce/complaint
 *
 * POST /api/webhooks/resend
 *
 * Resend sends events like:
 * - email.bounced → reason: bounce
 * - email.complained → reason: complaint
 */

export async function POST(req: NextRequest) {
  // Resend webhook verification (optional but recommended)
  // For now we verify the payload shape

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body as {
    type?: string;
    data?: {
      email_id?: string;
      to?: string[];
      tags?: Record<string, string>;
    };
  };

  const eventType = event?.type;
  const toEmails = event?.data?.to ?? [];
  const tags = event?.data?.tags ?? {};

  let reason: "bounce" | "complaint" | null = null;

  if (eventType === "email.bounced") {
    reason = "bounce";
  } else if (eventType === "email.complained") {
    reason = "complaint";
  } else {
    // Not a suppression event — acknowledge but ignore
    return NextResponse.json({ received: true });
  }

  // workspaceId should be embedded in tags or metadata
  const workspaceId = tags["workspaceId"] ?? tags["workspace_id"];

  if (!workspaceId) {
    // If no workspace ID, can't suppress — just acknowledge
    return NextResponse.json({ received: true });
  }

  // Verify workspace exists
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, workspaceId),
  });

  if (!workspace) {
    return NextResponse.json({ received: true });
  }

  // Suppress each bounced/complained address
  for (const email of toEmails) {
    const normalizedEmail = email.toLowerCase();

    const existing = await db.query.suppressions.findFirst({
      where: and(
        eq(suppressions.workspaceId, workspaceId),
        eq(suppressions.email, normalizedEmail),
      ),
    });

    if (!existing) {
      await db.insert(suppressions).values({
        workspaceId,
        email: normalizedEmail,
        reason,
      });

      // Fire webhook event if Pro plan
      if (workspace.plan === "pro") {
        deliverWebhookEvent(workspaceId, "subscriber.suppressed", {
          email: normalizedEmail,
          reason,
          source: "resend_webhook",
        }).catch(console.error);
      }
    }
  }

  return NextResponse.json({ received: true, processed: toEmails.length });
}
