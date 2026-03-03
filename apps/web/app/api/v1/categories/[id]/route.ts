import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, categories } from "@prefskit/db";
import { eq, and } from "@prefskit/db";
import { authenticateApiKey, isAuthError } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const updateCategorySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be kebab-case")
    .optional(),
  label: z.string().min(1).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  required: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

interface RouteParams {
  params: { id: string };
}

// PATCH /api/v1/categories/:id
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (!checkRateLimit(`cat:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // Verify category belongs to workspace
  const existing = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, params.id),
      eq(categories.workspaceId, auth.workspaceId),
    ),
  });

  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates = parsed.data;

  // Check slug uniqueness if changing slug
  if (updates.slug && updates.slug !== existing.slug) {
    const slugConflict = await db.query.categories.findFirst({
      where: and(
        eq(categories.workspaceId, auth.workspaceId),
        eq(categories.slug, updates.slug),
      ),
    });
    if (slugConflict) {
      return NextResponse.json(
        { error: `Category with slug '${updates.slug}' already exists` },
        { status: 409 },
      );
    }
  }

  const [updated] = await db
    .update(categories)
    .set(updates)
    .where(
      and(
        eq(categories.id, params.id),
        eq(categories.workspaceId, auth.workspaceId),
      ),
    )
    .returning();

  return NextResponse.json({ category: updated });
}

// DELETE /api/v1/categories/:id
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (!checkRateLimit(`cat:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const existing = await db.query.categories.findFirst({
    where: and(
      eq(categories.id, params.id),
      eq(categories.workspaceId, auth.workspaceId),
    ),
  });

  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await db
    .delete(categories)
    .where(
      and(
        eq(categories.id, params.id),
        eq(categories.workspaceId, auth.workspaceId),
      ),
    );

  return NextResponse.json({ success: true });
}
