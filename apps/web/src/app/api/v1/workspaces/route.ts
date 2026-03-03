import { NextRequest, NextResponse } from "next/server";
import { db } from "@prefskit/db";
import { workspaces } from "@prefskit/db/schema";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, unknown>;
  const name = body.name as string | undefined;
  const slug = body.slug as string | undefined;

  if (!name || !slug) {
    return NextResponse.json(
      { error: "name and slug required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  const [workspace] = await db
    .insert(workspaces)
    .values({ name, slug })
    .returning();

  return NextResponse.json(
    { workspace },
    { status: 201, headers: CORS_HEADERS },
  );
}
