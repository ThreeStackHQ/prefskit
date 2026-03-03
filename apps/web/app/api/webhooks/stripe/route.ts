import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db, workspaces } from "@prefskit/db";
import { eq } from "@prefskit/db";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

// POST /api/webhooks/stripe
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 },
    );
  }

  // Get raw body
  const rawBody = await req.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  try {
    await handleStripeEvent(event);
  } catch (err) {
    console.error("Error handling Stripe event:", err);
    return NextResponse.json(
      { error: "Event handler failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}

async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      const plan = session.metadata?.plan as "indie" | "pro" | undefined;

      if (!workspaceId || !plan) break;

      await db
        .update(workspaces)
        .set({
          plan,
          stripeCustomerId: session.customer as string | null,
          updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId));

      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspaceId;
      const plan = sub.metadata?.plan as "indie" | "pro" | undefined;

      if (!workspaceId || !plan) break;

      // Check if subscription is active
      const isActive = sub.status === "active" || sub.status === "trialing";
      if (!isActive) break;

      await db
        .update(workspaces)
        .set({ plan, updatedAt: new Date() })
        .where(eq(workspaces.id, workspaceId));

      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspaceId;

      if (!workspaceId) break;

      // Downgrade to free
      await db
        .update(workspaces)
        .set({ plan: "free", updatedAt: new Date() })
        .where(eq(workspaces.id, workspaceId));

      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }
}
