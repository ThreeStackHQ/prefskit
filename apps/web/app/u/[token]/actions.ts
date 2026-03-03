"use server";

import { redirect } from "next/navigation";
import { db, subscribers, categories, preferences, suppressions } from "@prefskit/db";
import { eq, and } from "@prefskit/db";
import { verifySubscriberToken } from "@/lib/tokens";

export async function updatePreferences({
  token,
  prefs,
}: {
  token: string;
  prefs: Record<string, boolean>;
}): Promise<void> {
  const payload = await verifySubscriberToken(token);
  if (!payload) throw new Error("Invalid token");

  const { email, workspaceId } = payload;

  // Get subscriber
  const subscriber = await db.query.subscribers.findFirst({
    where: and(
      eq(subscribers.workspaceId, workspaceId),
      eq(subscribers.email, email.toLowerCase()),
    ),
  });

  if (!subscriber) return;

  // Get workspace categories
  const workspaceCategories = await db.query.categories.findMany({
    where: eq(categories.workspaceId, workspaceId),
  });

  // Update each preference
  for (const category of workspaceCategories) {
    if (category.required) continue; // Skip required categories

    const subscribed = prefs[category.slug] ?? true;

    const existing = await db.query.preferences.findFirst({
      where: and(
        eq(preferences.subscriberId, subscriber.id),
        eq(preferences.categoryId, category.id),
      ),
    });

    if (existing) {
      await db
        .update(preferences)
        .set({ subscribed, updatedAt: new Date() })
        .where(eq(preferences.id, existing.id));
    } else {
      await db.insert(preferences).values({
        subscriberId: subscriber.id,
        categoryId: category.id,
        subscribed,
      });
    }
  }
}

export async function unsubscribeAll({
  email,
  workspaceId,
}: {
  email: string;
  workspaceId: string;
}): Promise<void> {
  const normalizedEmail = email.toLowerCase();

  const existing = await db.query.suppressions.findFirst({
    where: and(
      eq(suppressions.workspaceId, workspaceId),
      eq(suppressions.email, normalizedEmail),
    ),
  });

  if (!existing) {
    await db.insert(suppressions).values({
      workspaceId,
      email: normalizedEmail,
      reason: "global",
    });
  }

  redirect(`/`);
}
