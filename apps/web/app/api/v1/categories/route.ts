import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, categories } from "@prefskit/db";
import { eq, and, count } from "@prefskit/db";
import { authenticateApiKey, isAuthError } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const createCategorySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be kebab-case (lowercase, hyphens only)"),
  label: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  required: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

// GET /api/v1/categories
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  // Rate limit: 60/min per API key
  if (!checkRateLimit(`cat:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 },
    );
  }

  const rows = await db.query.categories.findMany({
    where: eq(categories.workspaceId, auth.workspaceId),
    orderBy: (cat, { asc }) => [asc(cat.sortOrder), asc(cat.createdAt)],
  });

  return NextResponse.json({ categories: rows });
}

// POST /api/v1/categories
export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  // Rate limit: 60/min per API key
  if (!checkRateLimit(`cat:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 },
    );
  }

  // Free tier: max 3 categories
  if (auth.plan === "free") {
    const [countResult] = await db
      .select({ count: count() })
      .from(categories)
      .where(eq(categories.workspaceId, auth.workspaceId));

    if ((countResult?.count ?? 0) >= 3) {
      return NextResponse.json(
        {
          error: "Free tier allows max 3 categories. Upgrade to Indie or Pro.",
          code: "FREE_TIER_LIMIT",
        },
        { status: 409 },
      );
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { slug, label, description, required, sortOrder } = parsed.data;

  // Check slug uniqueness within workspace
  const existing = await db.query.categories.findFirst({
    where: and(
      eq(categories.workspaceId, auth.workspaceId),
      eq(categories.slug, slug),
    ),
  });

  if (existing) {
    return NextResponse.json(
      { error: `Category with slug '${slug}' already exists` },
      { status: 409 },
    );
  }

  const [category] = await db
    .insert(categories)
    .values({
      workspaceId: auth.workspaceId,
      slug,
      label,
      description,
      required: required ?? false,
      sortOrder: sortOrder ?? 0,
    })
    .returning();

  return NextResponse.json({ category }, { status: 201 });
}
