"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { createCheckoutSession } from "@/lib/checkout";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "../loading";

export default function PaymentPage() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    if (!session?.user?.email) {
      toast.error(
        "No email address is associated with your account. Please update your profile before making a payment.",
      );
      return;
    }
    setIsLoading(true);
    try {
      const result = await createCheckoutSession(
        session.user.id,
        session.user.email,
      );
      // Redirect to Stripe Checkout
      if (result?.url) {
        window.location.href = result.url;
      } else {
        toast.error("No checkout URL returned");
        setIsLoading(false);
        return;
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  if (isPending) return <Loading />;

  //TODO: Eventually we also want to check if the user already activated their membership
  if (!session?.user) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please log in to start your membership
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/login")} className="w-full">
                Log In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (
    !session?.user?.emailVerified &&
    process.env.NODE_ENV !== "development" &&
    !isPending
  ) {
    return (
      <div className="container mx-auto p-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Email Verification Required</CardTitle>
              <CardDescription>
                Please verify your email address to make a payment
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>JOCA Membership Payment</CardTitle>
          <CardDescription>
            Complete your membership by making a payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You will be redirected to Stripe Checkout to securely complete
              your payment.
            </p>
            <p className="text-sm text-muted-foreground">
              Payment methods accepted: Credit/Debit cards, Apple Pay, Google
              Pay
            </p>
          </div>
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? "Processing..." : "Make Payment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
