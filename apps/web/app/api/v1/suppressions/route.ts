import { type NextRequest, NextResponse } from "next/server";
import { db, suppressions } from "@prefskit/db";
import { eq, count, asc } from "@prefskit/db";
import { authenticateApiKey, isAuthError } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

// GET /api/v1/suppressions?page=1&limit=50
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (!checkRateLimit(`sup-list:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));
  const offset = (page - 1) * limit;

  const [totalResult, rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(suppressions)
      .where(eq(suppressions.workspaceId, auth.workspaceId)),
    db.query.suppressions.findMany({
      where: eq(suppressions.workspaceId, auth.workspaceId),
      orderBy: (s, { desc }) => [desc(s.suppressedAt)],
      limit,
      offset,
    }),
  ]);

  const total = totalResult[0]?.count ?? 0;

  return NextResponse.json({
    suppressions: rows,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
