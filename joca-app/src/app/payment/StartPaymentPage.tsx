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
import { getPlanLabel } from "@/lib/membership-plans";

export const StartPaymentPage = ({
  approvedPlan,
}: {
  approvedPlan: string;
}) => {
  const { data: session, isPending } = useSessionReady();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const result = await subscription.upgrade({
        plan: approvedPlan,
        successUrl: "/payment/success",
        cancelUrl: "/payment/cancel",
      });
      if (result?.error) {
        toast.error(
          result.error.message ||
            "Failed to initiate payment. Please try again.",
        );
        return;
      }
    } catch {
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted || isPending) return <Loading />;

  if (!session?.user) return <NotLoggedIn />;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete JOCA membership payment</CardTitle>
          <CardDescription>
            Your application was approved for{" "}
            <strong>{getPlanLabel(approvedPlan)}</strong>. Complete payment to
            activate your membership.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You will be redirected to Stripe Checkout to securely complete
              your payment. You may also use the payment link emailed to you
              after approval.
            </p>
            <p className="text-sm text-muted-foreground">
              Payment methods accepted: Credit/Debit cards.
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
