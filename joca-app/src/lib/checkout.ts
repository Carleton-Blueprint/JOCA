"use server";

import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createCheckoutSession(userId: string, userEmail: string) {
  try {
    const betterAuthSession = await auth.api.getSession({
      headers: await headers(),
    });

    //Server-side check to ensure user is authenticated
    if (!betterAuthSession) {
      throw new Error("User not authenticated");
    }

    // Get the membership price from environment variable or use a default
    const membershipPrice =
      process.env.STRIPE_PRICE_ID || process.env.STRIPE_MEMBERSHIP_PRICE_ID;

    if (!membershipPrice) {
      throw new Error(
        "STRIPE_PRICE_ID or STRIPE_MEMBERSHIP_PRICE_ID is not set in environment variables",
      );
    }

    // Fetch the price to determine if it's recurring or one-time
    const price = await stripe.prices.retrieve(membershipPrice);
    const isRecurring = price.recurring !== null;

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: isRecurring ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: membershipPrice,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
      success_url: `${process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000"}/payment/cancel`,
    });

    // Return the checkout URL instead of redirecting directly
    // This allows the client to handle the redirect
    if (session.url) {
      return { url: session.url };
    } else {
      throw new Error("Failed to create checkout session URL");
    }
  } catch (error) {
    // Re-throw redirect errors (Next.js uses these internally)
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to create checkout session");
  }
}
