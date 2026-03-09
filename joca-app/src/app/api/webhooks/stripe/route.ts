import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = (await headers()).get("stripe-signature");

    let event: any;

    // In development without STRIPE_WEBHOOK_SECRET, skip verification for testing
    if (!endpointSecret && process.env.NODE_ENV === "development") {
      event = JSON.parse(body);
    } else {
      try {
        event = stripe.webhooks.constructEvent(body, sig!, endpointSecret!);
      } catch (err: any) {
        console.error(`Webhook signature verification failed.`, err.message);
        return NextResponse.json({ error: "Webhook error" }, { status: 400 });
      }
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        // Get the user ID from metadata
        const userId = session.metadata?.userId;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { hasPaid: true },
          });
        } else {
          return NextResponse.json(
            { error: "No userId in metadata" },
            { status: 400 },
          );
        }

        break;
      default:
        // Unhandled event type - silently ignore
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
