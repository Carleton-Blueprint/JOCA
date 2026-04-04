import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NotLoggedIn } from "@/components/NotLoggedIn";
import { createMember, getMemberByEmail } from "@/lib/actions";

export default async function PaymentSuccessPage() {
  const authSession = await auth.api.getSession({ headers: await headers() });
  if (!authSession?.user) return <NotLoggedIn />;

  const { user } = authSession;

  const activeSubscription = await prisma.subscription.findFirst({
    where: { referenceId: user.id, status: "active" },
  });
  const paymentVerified = activeSubscription ? true : false;

  //Console errors here can be found in Vercel logs
  if (paymentVerified) {
    try {
      const existing = await getMemberByEmail(user.email);
      if (!existing) {
        const { firstName, lastName } = user;

        if (!user.phoneNumber) {
          throw new Error(
            "Phone number is required but not found in user session",
          );
        }

        await createMember(firstName, lastName, user.email, user.phoneNumber);
      }
    } catch (error) {
      console.error("Failed to fetch/create member in Strapi:", error);
      // Don't block the success page - member creation is not critical for payment confirmation
      //Page will still render. Will retry on next load
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle
            className={paymentVerified ? "text-green-600" : "text-amber-600"}
          >
            {paymentVerified ? "Payment Successful!" : "Payment Pending"}
          </CardTitle>
          <CardDescription>
            {paymentVerified
              ? "Thank you for your membership payment"
              : "Your payment has yet to be confirmed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentVerified ? (
            <>
              <p className="text-sm text-green-600 font-medium">
                Payment verified! Your membership is now active.
              </p>
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
                Your payment could not be confirmed yet. If you paid, your
                membership status will be updated shortly. If this persists,
                please contact support.
              </p>
              <p className="text-xs text-muted-foreground">
                If you did not pay, please go here to try again:
                <Button asChild variant="outline" className="ml-2">
                  <Link href="/payment">Try Again</Link>
                </Button>
              </p>
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
