import { NextRequest, NextResponse } from "next/server";
import { db } from "@prefskit/db";
import { categories } from "@prefskit/db/schema";
import { eq } from "drizzle-orm";
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

  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.workspaceId, apiKey.workspaceId));

  return NextResponse.json({ categories: rows }, { headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
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
  const slug = body.slug as string | undefined;
  const label = body.label as string | undefined;
  const description = (body.description as string) ?? null;
  const required = (body.required as boolean) ?? false;
  const sortOrder = (body.sortOrder as number) ?? 0;

  if (!slug || !label) {
    return NextResponse.json(
      { error: "slug and label required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const [category] = await db
    .insert(categories)
    .values({
      workspaceId: apiKey.workspaceId,
      slug,
      label,
      description,
      required,
      sortOrder,
    })
    .returning();

  return NextResponse.json(
    { category },
    { status: 201, headers: CORS_HEADERS },
  );
}
