import { NextRequest, NextResponse } from "next/server";
import { db } from "@prefskit/db";
import { preferences, subscribers } from "@prefskit/db/schema";
import { eq, and } from "drizzle-orm";
import { authenticateApiKey } from "@/lib/api-auth";
import { rateLimit } from "@/lib/rate-limit";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const apiKeyStr = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKeyStr) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`ip:${ip}`, 60, 60000)) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: CORS_HEADERS },
    );
  }
  if (!rateLimit(`key:${apiKeyStr}`, 30, 60000)) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: CORS_HEADERS },
    );
  }

  const apiKey = await authenticateApiKey(apiKeyStr);
  if (!apiKey) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const subscriberId = req.nextUrl.searchParams.get("subscriberId");
  if (!subscriberId) {
    return NextResponse.json(
      { error: "subscriberId query param required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  // IDOR check: subscriber must belong to workspace
  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(
      and(
        eq(subscribers.id, subscriberId),
        eq(subscribers.workspaceId, apiKey.workspaceId),
      ),
    )
    .limit(1);

  if (!subscriber) {
    return NextResponse.json(
      { error: "Subscriber not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const rows = await db
    .select()
    .from(preferences)
    .where(eq(preferences.subscriberId, subscriberId));

  return NextResponse.json({ preferences: rows }, { headers: CORS_HEADERS });
}

export async function PUT(req: NextRequest) {
  const apiKeyStr = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!apiKeyStr) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!rateLimit(`ip:${ip}`, 60, 60000)) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: CORS_HEADERS },
    );
  }
  if (!rateLimit(`key:${apiKeyStr}`, 30, 60000)) {
    return NextResponse.json(
      { error: "Rate limited" },
      { status: 429, headers: CORS_HEADERS },
    );
  }

  const apiKey = await authenticateApiKey(apiKeyStr);
  if (!apiKey) {
    return NextResponse.json(
      { error: "Invalid API key" },
      { status: 401, headers: CORS_HEADERS },
    );
  }

  const body = (await req.json()) as Record<string, unknown>;
  const subscriberId = body.subscriberId as string | undefined;
  const categoryId = body.categoryId as string | undefined;
  const subscribed = body.subscribed as boolean | undefined;

  if (!subscriberId || !categoryId || typeof subscribed !== "boolean") {
    return NextResponse.json(
      { error: "subscriberId, categoryId, and subscribed required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  // IDOR check: subscriber must belong to workspace
  const [subscriber] = await db
    .select()
    .from(subscribers)
    .where(
      and(
        eq(subscribers.id, subscriberId),
        eq(subscribers.workspaceId, apiKey.workspaceId),
      ),
    )
    .limit(1);

  if (!subscriber) {
    return NextResponse.json(
      { error: "Subscriber not found" },
      { status: 404, headers: CORS_HEADERS },
    );
  }

  const [preference] = await db
    .insert(preferences)
    .values({ subscriberId, categoryId, subscribed })
    .onConflictDoUpdate({
      target: [preferences.subscriberId, preferences.categoryId],
      set: { subscribed, updatedAt: new Date() },
    })
    .returning();

  return NextResponse.json({ preference }, { headers: CORS_HEADERS });
}
