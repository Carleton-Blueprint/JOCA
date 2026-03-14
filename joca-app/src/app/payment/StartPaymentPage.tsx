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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Loading from "../loading";
import { NotLoggedIn } from "@/components/NotLoggedIn";

export const StartPaymentPage = () => {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

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

  if (!isMounted || isPending) return <Loading />;

  if (!session?.user) return <NotLoggedIn />;

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
};
