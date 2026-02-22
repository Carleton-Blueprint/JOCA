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

export default function PaymentPage() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }

    if (!session.user.email) {
      toast.error(
        "No email address is associated with your account. Please update your profile before making a payment.",
      );
      setIsLoading(false);
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
      }
    } catch (error) {
      setIsLoading(false);
      toast.error("Failed to initiate payment. Please try again.");
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
    }
  };

  if (isPending) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please log in to make a payment</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/login")} className="w-full">
                Go to Login
              </Button>
            </CardContent>
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
