import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, workspaces, workspaceMembers } from "@prefskit/db";
import { eq } from "@prefskit/db";

const checkoutSchema = z.object({
  plan: z.enum(["indie", "pro"]),
});

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

const PRICE_IDS: Record<string, string | undefined> = {
  indie: process.env.STRIPE_INDIE_PRICE_ID,
  pro: process.env.STRIPE_PRO_PRICE_ID,
};

// POST /api/stripe/checkout
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { plan } = parsed.data;
  const priceId = PRICE_IDS[plan];

  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID for plan '${plan}' is not configured` },
      { status: 500 },
    );
  }

  // Get user's workspace
  const membership = await db.query.workspaceMembers.findFirst({
    where: eq(workspaceMembers.userId, session.user.id),
    with: { workspace: true },
  });

  if (!membership) {
    return NextResponse.json(
      { error: "No workspace found for this user" },
      { status: 404 },
    );
  }

  const workspace = membership.workspace;
  const stripe = getStripe();
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  // Create Stripe Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard/billing?success=1`,
    cancel_url: `${baseUrl}/dashboard/billing?canceled=1`,
    customer_email: workspace.stripeCustomerId ? undefined : session.user.email ?? undefined,
    customer: workspace.stripeCustomerId ?? undefined,
    metadata: {
      workspaceId: workspace.id,
      plan,
    },
    subscription_data: {
      metadata: {
        workspaceId: workspace.id,
        plan,
      },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
