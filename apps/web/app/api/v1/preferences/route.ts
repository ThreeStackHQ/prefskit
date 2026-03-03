import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, subscribers, categories, preferences } from "@prefskit/db";
import { eq, and } from "@prefskit/db";
import { authenticateApiKey, isAuthError } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { deliverWebhookEvent } from "@/lib/webhooks";

const updatePrefSchema = z.object({
  email: z.string().email(),
  category: z.string().min(1),
  subscribed: z.boolean(),
});

// POST /api/v1/preferences
export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req);
  if (isAuthError(auth)) return auth;

  if (!checkRateLimit(`prefs:${auth.keyId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updatePrefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { email, category: categorySlug, subscribed } = parsed.data;

  // Look up category
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

  // Cannot update required categories
  if (category.required && !subscribed) {
    return NextResponse.json(
      { error: "Cannot unsubscribe from a required category" },
      { status: 400 },
    );
  }

  // Upsert subscriber
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

  // Upsert preference
  const existing = await db.query.preferences.findFirst({
    where: and(
      eq(preferences.subscriberId, subscriber.id),
      eq(preferences.categoryId, category.id),
    ),
  });

  let pref;
  if (existing) {
    const [updated] = await db
      .update(preferences)
      .set({ subscribed, updatedAt: new Date() })
      .where(eq(preferences.id, existing.id))
      .returning();
    pref = updated;
  } else {
    const [created] = await db
      .insert(preferences)
      .values({
        subscriberId: subscriber.id,
        categoryId: category.id,
        subscribed,
      })
      .returning();
    pref = created;
  }

  // Fire webhook event (Pro plan only)
  if (auth.plan === "pro") {
    deliverWebhookEvent(auth.workspaceId, "subscriber.preference_updated", {
      email,
      category: categorySlug,
      subscribed,
    }).catch(console.error);
  }

  return NextResponse.json({ preference: pref });
}
