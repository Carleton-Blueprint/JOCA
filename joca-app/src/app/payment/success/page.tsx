import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NotLoggedIn } from "@/components/NotLoggedIn";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  const authSession = await auth.api.getSession({ headers: await headers() });
  if (!authSession?.user) return <NotLoggedIn />;

  let paymentVerified = authSession.user.hasPaid;

  if (!paymentVerified && session_id) {
    try {
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
      const isPaid =
        checkoutSession.payment_status === "paid" ||
        checkoutSession.status === "complete";
      const belongsToUser = checkoutSession.metadata?.userId === authSession.user.id;

      if (isPaid && belongsToUser) {
        await prisma.user.update({
          where: { id: authSession.user.id },
          data: { hasPaid: true },
        });
        paymentVerified = true;
      }
    } catch (error) {
      console.error("Failed to verify Stripe session:", error);
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className={paymentVerified ? "text-green-600" : "text-amber-600"}>
            {paymentVerified ? "Payment Successful!" : "Payment Pending"}
          </CardTitle>
          <CardDescription>
            {paymentVerified
              ? "Thank you for your membership payment"
              : "Your payment is still being processed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentVerified ? (
            <>
              <p className="text-sm text-green-600 font-medium">
                Payment verified! Your membership is now active.
              </p>
              {session_id && (
                <p className="text-xs text-muted-foreground">Session ID: {session_id}</p>
              )}
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/">Go to Home</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/elections">View Elections</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Your payment was received but could not be confirmed yet. Your
                membership status will be updated shortly. If this persists,
                please contact support.
              </p>
              {session_id && (
                <p className="text-xs text-muted-foreground">Session ID: {session_id}</p>
              )}
              <Button asChild>
                <Link href="/">Go to Home</Link>
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
