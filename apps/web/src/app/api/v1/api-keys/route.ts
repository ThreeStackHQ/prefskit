import { NextRequest, NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";
import { db } from "@prefskit/db";
import { apiKeys } from "@prefskit/db/schema";

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
  const workspaceId = body.workspaceId as string | undefined;
  const label = body.label as string | undefined;

  if (!workspaceId || !label) {
    return NextResponse.json(
      { error: "workspaceId and label required" },
      { status: 400, headers: CORS_HEADERS },
    );
  }

  // Generate plaintext key (32 random bytes as hex = 64 chars)
  const plaintext = `pk_${randomBytes(32).toString("hex")}`;
  const keyHash = createHash("sha256").update(plaintext).digest("hex");

  const [apiKey] = await db
    .insert(apiKeys)
    .values({ workspaceId, keyHash, label })
    .returning();

  // Return plaintext ONCE — it is never stored
  return NextResponse.json(
    {
      apiKey: {
        id: apiKey.id,
        label: apiKey.label,
        key: plaintext,
        createdAt: apiKey.createdAt,
      },
    },
    { status: 201, headers: CORS_HEADERS },
  );
}
