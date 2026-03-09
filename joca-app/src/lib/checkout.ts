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
    const membershipPrice = process.env.STRIPE_PRICE_ID;

    if (!membershipPrice) {
      throw new Error("STRIPE_PRICE_ID is not set in environment variables");
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: membershipPrice,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      //Prevents spoofing later on by another user passing someone else's userId
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
      success_url: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/payment/cancel`,
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
