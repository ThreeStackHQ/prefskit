import { NextRequest, NextResponse } from "next/server";
import { db } from "@prefskit/db";
import { preferences, subscribers, categories } from "@prefskit/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "@/lib/token";
import { rateLimit } from "@/lib/rate-limit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`unsub:${ip}`, 10, 60000)) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: CORS_HEADERS },
    );
  }

  const result = verifyToken(params.token);
  if (!result) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(
      and(
        eq(subscribers.email, result.email),
        eq(subscribers.workspaceId, result.workspaceId),
      ),
    )
    .limit(1);

  if (!subscriber) {
    return NextResponse.json(
      { error: "Subscriber not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const cats = await db
    .select()
    .from(categories)
    .where(eq(categories.workspaceId, result.workspaceId));

  const prefs = await db
    .select()
    .from(preferences)
    .where(eq(preferences.subscriberId, subscriber.id));

  return NextResponse.json(
    { categories: cats, preferences: prefs },
    { headers: CORS_HEADERS },
  );
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { token: string } },
) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`unsub:${ip}`, 10, 60000)) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: CORS_HEADERS },
    );
  }

  const result = verifyToken(params.token);
  if (!result) {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(
      and(
        eq(subscribers.email, result.email),
        eq(subscribers.workspaceId, result.workspaceId),
      ),
    )
    .limit(1);

  if (!subscriber) {
    return NextResponse.json(
      { error: "Subscriber not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const body = (await req.json()) as Record<string, unknown>;
  const updates = body.preferences as
    | Array<{ categoryId: string; subscribed: boolean }>
    | undefined;

  if (!updates || !Array.isArray(updates)) {
    return NextResponse.json(
      { error: "preferences array required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  for (const update of updates) {
    await db
      .insert(preferences)
      .values({
        subscriberId: subscriber.id,
        categoryId: update.categoryId,
        subscribed: update.subscribed,
      })
      .onConflictDoUpdate({
        target: [preferences.subscriberId, preferences.categoryId],
        set: { subscribed: update.subscribed, updatedAt: new Date() },
      });
  }

  return NextResponse.json({ success: true }, { headers: CORS_HEADERS });
}
