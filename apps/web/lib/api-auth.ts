import { createHash } from "crypto";
import { db, apiKeys, workspaces } from "@prefskit/db";
import { eq } from "@prefskit/db";
import { type NextRequest, NextResponse } from "next/server";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export type AuthedWorkspace = {
  workspaceId: string;
  plan: "free" | "indie" | "pro";
  keyId: string;
};

/**
 * Authenticate a request using Bearer API key.
 * Returns AuthedWorkspace or a 401/429 NextResponse.
 */
export async function authenticateApiKey(
  req: NextRequest,
): Promise<AuthedWorkspace | NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 },
    );
  }

  const rawKey = authHeader.slice(7).trim();
  if (!rawKey) {
    return NextResponse.json({ error: "API key is empty" }, { status: 401 });
  }

  const keyHash = hashApiKey(rawKey);

  const keyRow = await db.query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, keyHash),
  });

  if (!keyRow) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Get workspace plan
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.id, keyRow.workspaceId),
  });

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace not found" },
      { status: 401 },
    );
  }

  // Update lastUsedAt (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRow.id))
    .catch(console.error);

  return {
    workspaceId: keyRow.workspaceId,
    plan: workspace.plan,
    keyId: keyRow.id,
  };
}

/** Type guard: is the result an error response? */
export function isAuthError(
  result: AuthedWorkspace | NextResponse,
): result is NextResponse {
  return result instanceof NextResponse;
}
