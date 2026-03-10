import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (process.env.NODE_ENV === "production" && !endpointSecret) {
  throw new Error(
    "STRIPE_WEBHOOK_SECRET environment variable is not set in production.",
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = (await headers()).get("stripe-signature");

    let event: any;

    // In development without STRIPE_WEBHOOK_SECRET, skip verification for testing
    if (!endpointSecret || process.env.NODE_ENV !== "production") {
      event = JSON.parse(body);
    } else {
      try {
        event = stripe.webhooks.constructEvent(body, sig!, endpointSecret!);
      } catch (err: any) {
        return NextResponse.json(
          { error: "Webhook error: " + err.message },
          { status: 400 },
        );
      }
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (!userId) {
          console.error("checkout.session.completed: no userId in metadata");
          break;
        }

        if (session.payment_status === "paid") {
          await prisma.user.update({
            where: { id: userId },
            data: { hasPaid: true },
          });
        }
        // if payment_status !== "paid", invoice.paid will fire when it clears
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId as string,
          );
          const userId = subscription.metadata?.userId;

          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: { hasPaid: true },
            });
          }
        }
        break;
      }

      default:
        // Unhandled event type - silently ignore
        break;
    }

    //Returns 200 by defualt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 },
    );
  }
}
