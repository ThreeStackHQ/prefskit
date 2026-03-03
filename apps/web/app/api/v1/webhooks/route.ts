import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db, webhookEndpoints } from "@prefskit/db";
import { eq } from "@prefskit/db";
import { authenticateApiKey, isAuthError } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_EVENTS = [
  "subscriber.suppressed",
  "subscriber.preference_updated",
  "subscriber.restored",
] as const;

const createWebhookSchema = z.object({
  url: z.string().url("Must be a valid HTTPS URL").refine(
    (url) => url.startsWith("https://"),
    "Webhook URL must use HTTPS",
  ),
  events: z
    .array(z.enum(VALID_EVENTS))
    .min(1, "Must subscribe to at least one event"),
  secret: z.string().min(16).max(256).optional(),
});

// GET /api/v1/webhooks
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (auth.plan !== "pro") {
    return NextResponse.json(
      { error: "Webhooks are a Pro plan feature. Upgrade to access." },
      { status: 403 },
    );
  }

  if (!checkRateLimit(`wh:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const endpoints = await db.query.webhookEndpoints.findMany({
    where: eq(webhookEndpoints.workspaceId, auth.workspaceId),
    orderBy: (e, { desc }) => [desc(e.createdAt)],
  });

  // Mask secret in response
  return NextResponse.json({
    webhooks: endpoints.map((e) => ({
      ...e,
      secret: `${e.secret.slice(0, 8)}...`,
    })),
  });
}

// POST /api/v1/webhooks
export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (auth.plan !== "pro") {
    return NextResponse.json(
      { error: "Webhooks are a Pro plan feature. Upgrade to access." },
      { status: 403 },
    );
  }

  if (!checkRateLimit(`wh:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { url, events, secret } = parsed.data;

  // Auto-generate secret if not provided
  const webhookSecret = secret ?? randomBytes(32).toString("hex");

  const [endpoint] = await db
    .insert(webhookEndpoints)
    .values({
      workspaceId: auth.workspaceId,
      url,
      secret: webhookSecret,
      events,
    })
    .returning();

  return NextResponse.json({ webhook: endpoint }, { status: 201 });
}
