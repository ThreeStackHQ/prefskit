import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, suppressions } from "@prefskit/db";
import { eq, and } from "@prefskit/db";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * RFC 8058 one-click unsubscribe endpoint.
 * No authentication required — protected by rate limit only.
 *
 * POST /api/unsubscribe
 * Body: { email, workspaceId } OR form-data: List-Unsubscribe=One-Click
 */

const unsubscribeSchema = z.object({
  email: z.string().email(),
  workspaceId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  // Rate limit: 10/min per IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(`unsub:${ip}`, 10, 60_000)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 },
    );
  }

  let body: unknown;
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    // RFC 8058 form-based
    const formData = await req.formData();
    body = Object.fromEntries(formData);
  } else {
    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 415 },
    );
  }

  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, workspaceId } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  // Idempotent upsert
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
      reason: "global",
    });
  }

  // RFC 8058: respond with 200 and no redirect
  return NextResponse.json({ success: true }, { status: 200 });
}
