"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSessionReady, subscription } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "../loading";
import { NotLoggedIn } from "@/components/NotLoggedIn";

export const StartPaymentPage = () => {
  const { data: session, isPending } = useSessionReady();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      await subscription.upgrade({
        plan: "membership",
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
      });
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
