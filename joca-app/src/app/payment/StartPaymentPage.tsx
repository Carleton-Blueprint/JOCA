"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSessionReady, subscription } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Loading from "../loading";
import { NotLoggedIn } from "@/components/NotLoggedIn";

const PLANS = [
  { id: "senior-membership", label: "Senior Membership" },
  { id: "general-membership", label: "General Membership" },
  { id: "family-membership", label: "Family Membership" },
  {
    id: "student-associate-membership",
    label: "Student / Associate Membership",
  },
];

export const StartPaymentPage = () => {
  const { data: session, isPending } = useSessionReady();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  useEffect(() => setIsMounted(true), []);

  const handlePayment = async () => {
    if (!selectedPlan) {
      toast.error("Please select a membership plan.");
      return;
    }
    setIsLoading(true);
    try {
      await subscription.upgrade({
        plan: selectedPlan,
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
            Select a membership plan and complete your payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center space-x-3 rounded-md border p-4"
              >
                <RadioGroupItem value={plan.id} id={plan.id} />
                <Label
                  htmlFor={plan.id}
                  className="cursor-pointer flex-1 leading-5"
                >
                  {plan.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You will be redirected to Stripe Checkout to securely complete
              your payment.
            </p>
            <p className="text-sm text-muted-foreground">
              Payment methods accepted: Credit/Debit cards.
            </p>
          </div>
          <Button
            onClick={handlePayment}
            disabled={isLoading || !selectedPlan}
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
