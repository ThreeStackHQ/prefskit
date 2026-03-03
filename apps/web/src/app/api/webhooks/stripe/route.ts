import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  // Read raw body before any JSON parsing — required by Stripe SDK
  const rawBody = Buffer.from(await req.arrayBuffer());

  try {
    // Dynamic import to keep Stripe optional at build time
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    });

    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        // Handle checkout completion
        break;
      }
      case "customer.subscription.updated": {
        // Handle subscription update
        break;
      }
      case "customer.subscription.deleted": {
        // Handle subscription cancellation
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook error: ${message}` },
      { status: 400 },
    );
  }
}
