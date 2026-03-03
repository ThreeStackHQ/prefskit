import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, suppressions } from "@prefskit/db";
import { eq, and } from "@prefskit/db";
import { authenticateApiKey, isAuthError } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { deliverWebhookEvent } from "@/lib/webhooks";

const suppressSchema = z.object({
  email: z.string().email(),
  reason: z.enum(["global", "bounce", "complaint"]).default("global"),
});

const deleteSchema = z.object({
  email: z.string().email(),
});

// POST /api/v1/suppress
export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (!checkRateLimit(`sup:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = suppressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, reason } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // Upsert suppression (idempotent)
  const existing = await db.query.suppressions.findFirst({
    where: and(
      eq(suppressions.workspaceId, auth.workspaceId),
      eq(suppressions.email, normalizedEmail),
    ),
  });

  if (existing) {
    return NextResponse.json({ suppression: existing });
  }

  const [suppression] = await db
    .insert(suppressions)
    .values({
      workspaceId: auth.workspaceId,
      email: normalizedEmail,
      reason,
    })
    .returning();

  // Fire webhook event (Pro plan only)
  if (auth.plan === "pro") {
    deliverWebhookEvent(auth.workspaceId, "subscriber.suppressed", {
      email: normalizedEmail,
      reason,
    }).catch(console.error);
  }

  return NextResponse.json({ suppression }, { status: 201 });
}

// DELETE /api/v1/suppress
export async function DELETE(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (!checkRateLimit(`sup:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  await db
    .delete(suppressions)
    .where(
      and(
        eq(suppressions.workspaceId, auth.workspaceId),
        eq(suppressions.email, email.toLowerCase()),
      ),
    );

  // Fire webhook event (Pro plan only)
  if (auth.plan === "pro") {
    deliverWebhookEvent(auth.workspaceId, "subscriber.restored", {
      email: email.toLowerCase(),
    }).catch(console.error);
  }

  return NextResponse.json({ success: true });
}
