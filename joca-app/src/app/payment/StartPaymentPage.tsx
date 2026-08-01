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
import { formatEtransferSecurityLine } from "@/lib/etransfer-copy";

export const StartPaymentPage = ({
  approvedPlan,
  etransferEmail,
  etransferNotes,
  etransferSecurityQuestion,
  etransferSecurityAnswer,
}: {
  approvedPlan: string;
  etransferEmail: string | null;
  etransferNotes: string | null;
  etransferSecurityQuestion: string | null;
  etransferSecurityAnswer: string | null;
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

  const etransferSecurityLine = formatEtransferSecurityLine({
    securityQuestion: etransferSecurityQuestion,
    securityAnswer: etransferSecurityAnswer,
    notes: etransferNotes,
    strong: (children) => (
      <strong className="text-foreground">{children}</strong>
    ),
  });

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
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold">Pay by card</h2>
            <p className="text-sm text-muted-foreground">
              You will be redirected to Stripe Checkout to securely complete
              your payment. You may also use the card payment link emailed to
              you after approval.
            </p>
            <Button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Processing..." : "Pay with card"}
            </Button>
          </div>

          {etransferEmail && (
            <div className="space-y-3 border-t pt-6">
              <h2 className="text-sm font-semibold">
                Pay by Interac e-Transfer
              </h2>
              <p className="text-sm text-muted-foreground">
                Send an Interac e-Transfer for your{" "}
                <strong>{getPlanLabel(approvedPlan)}</strong> to:
              </p>
              <p className="text-sm font-medium">{etransferEmail}</p>
              {etransferSecurityLine && (
                <p className="text-sm text-muted-foreground">
                  {etransferSecurityLine}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                Include your full name and account email in the message so JOCA
                can match your payment. Access is activated after staff confirm
                receipt — this is not automatic.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
