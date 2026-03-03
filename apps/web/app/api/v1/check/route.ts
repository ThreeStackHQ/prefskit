import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, subscribers, categories, preferences, suppressions } from "@prefskit/db";
import { eq, and } from "@prefskit/db";
import { authenticateApiKey, isAuthError } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const checkSchema = z.object({
  email: z.string().email(),
  category: z.string().min(1),
});

// POST /api/v1/check
export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (!checkRateLimit(`check:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, category: categorySlug } = parsed.data;

  // 1. Check suppressions (global block)
  const suppression = await db.query.suppressions.findFirst({
    where: and(
      eq(suppressions.workspaceId, auth.workspaceId),
      eq(suppressions.email, email.toLowerCase()),
    ),
  });

  if (suppression) {
    return NextResponse.json({
      allowed: false,
      reason: `Email is suppressed (${suppression.reason})`,
    });
  }

  // 2. Look up category
  const category = await db.query.categories.findFirst({
    where: and(
      eq(categories.workspaceId, auth.workspaceId),
      eq(categories.slug, categorySlug),
    ),
  });

  if (!category) {
    return NextResponse.json(
      { error: `Category '${categorySlug}' not found` },
      { status: 404 },
    );
  }

  // 3. If required category, always allowed
  if (category.required) {
    return NextResponse.json({ allowed: true, reason: "required_category" });
  }

  // 4. Upsert subscriber
  let subscriber = await db.query.subscribers.findFirst({
    where: and(
      eq(subscribers.workspaceId, auth.workspaceId),
      eq(subscribers.email, email.toLowerCase()),
    ),
  });

  if (!subscriber) {
    const [created] = await db
      .insert(subscribers)
      .values({
        workspaceId: auth.workspaceId,
        email: email.toLowerCase(),
      })
      .returning();
    subscriber = created;
  }

  if (!subscriber) {
    return NextResponse.json({ error: "Failed to upsert subscriber" }, { status: 500 });
  }

  // 5. Upsert preference (default: subscribed=true)
  let pref = await db.query.preferences.findFirst({
    where: and(
      eq(preferences.subscriberId, subscriber.id),
      eq(preferences.categoryId, category.id),
    ),
  });

  if (!pref) {
    const [created] = await db
      .insert(preferences)
      .values({
        subscriberId: subscriber.id,
        categoryId: category.id,
        subscribed: true,
      })
      .returning();
    pref = created;
  }

  if (!pref) {
    return NextResponse.json({ error: "Failed to upsert preference" }, { status: 500 });
  }

  return NextResponse.json({
    allowed: pref.subscribed,
    ...(pref.subscribed ? {} : { reason: "user_unsubscribed" }),
  });
}
