"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MEMBERSHIP_PLANS,
  MEMBERSHIP_STATUS,
  getPlanLabel,
  getMembershipStatusLabel,
} from "@/lib/membership-plans";
import {
  approveMembershipAction,
  confirmEtransferAction,
  rejectMembershipAction,
} from "./actions";

type Applicant = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  requestedPlan: string | null;
  membershipStatus: string;
  approvedPlan: string | null;
};

function isDecidedStatus(status: string): boolean {
  return (
    status === MEMBERSHIP_STATUS.APPROVED ||
    status === MEMBERSHIP_STATUS.REJECTED
  );
}

export function ApproveMembershipForm({
  token,
  applicant,
  hasActiveSubscription,
  etransferEnabled,
}: {
  token: string;
  applicant: Applicant;
  hasActiveSubscription: boolean;
  etransferEnabled: boolean;
}) {
  const [planId, setPlanId] = useState(
    applicant.approvedPlan ||
      applicant.requestedPlan ||
      MEMBERSHIP_PLANS[0].id,
  );
  const [status, setStatus] = useState(applicant.membershipStatus);
  const [paid, setPaid] = useState(hasActiveSubscription);
  const [message, setMessage] = useState<string | null>(() => {
    if (hasActiveSubscription) {
      return "This member already has an active membership.";
    }
    if (applicant.membershipStatus === MEMBERSHIP_STATUS.REJECTED) {
      return "This application was rejected. No further action is needed.";
    }
    if (applicant.membershipStatus === MEMBERSHIP_STATUS.APPROVED) {
      return etransferEnabled
        ? "Application already approved. Confirm Interac e-Transfer below once payment is received, or the member can pay by card."
        : "Application already approved. The member can complete card payment via the emailed Stripe link.";
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const decided = isDecidedStatus(status);
  const awaitingEtransfer =
    !paid && status === MEMBERSHIP_STATUS.APPROVED && etransferEnabled;
  const controlsDisabled = isPending || decided;

  if (paid) {
    return (
      <Card className="w-full max-w-xl mx-auto my-12">
        <CardHeader>
          <CardTitle>Membership active</CardTitle>
          <CardDescription>
            {applicant.firstName} {applicant.lastName} already has an active
            membership. No further action is needed.
          </CardDescription>
        </CardHeader>
        {message && (
          <CardContent>
            <p className="text-sm text-green-700 dark:text-green-400">
              {message}
            </p>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto my-12">
      <CardHeader>
        <CardTitle>Review membership application</CardTitle>
        <CardDescription>
          {!decided
            ? "Confirm or change the membership type, then approve to email payment options to the member."
            : status === MEMBERSHIP_STATUS.APPROVED
              ? "Waiting for payment. Confirm Interac e-Transfer when funds arrive, or wait for Stripe Checkout."
              : "This application has already been reviewed."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Name</dt>
            <dd className="font-medium">
              {applicant.firstName} {applicant.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{applicant.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="font-medium">{applicant.phoneNumber}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Requested plan</dt>
            <dd className="font-medium">
              {getPlanLabel(applicant.requestedPlan)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Current status</dt>
            <dd className="font-medium">{getMembershipStatusLabel(status)}</dd>
          </div>
          {status === MEMBERSHIP_STATUS.APPROVED && (
            <div>
              <dt className="text-muted-foreground">Approved plan</dt>
              <dd className="font-medium">{getPlanLabel(planId)}</dd>
            </div>
          )}
        </dl>

        {!decided && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="planId">Membership type to approve</Label>
              <Select
                value={planId}
                onValueChange={setPlanId}
                disabled={controlsDisabled}
              >
                <SelectTrigger id="planId" className="w-full">
                  <SelectValue placeholder="Select a membership type" />
                </SelectTrigger>
                <SelectContent>
                  {MEMBERSHIP_PLANS.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                className="flex-1"
                disabled={controlsDisabled}
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  const fd = new FormData();
                  fd.set("token", token);
                  fd.set("planId", planId);
                  startTransition(async () => {
                    const result = await approveMembershipAction(fd);
                    if (result.ok) {
                      setStatus(MEMBERSHIP_STATUS.APPROVED);
                      setMessage(result.message);
                    } else {
                      setError(result.message);
                    }
                  });
                }}
              >
                {isPending ? "Working..." : "Approve & email payment options"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={controlsDisabled}
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  const fd = new FormData();
                  fd.set("token", token);
                  startTransition(async () => {
                    const result = await rejectMembershipAction(fd);
                    if (result.ok) {
                      setStatus(MEMBERSHIP_STATUS.REJECTED);
                      setMessage(result.message);
                    } else {
                      setError(result.message);
                    }
                  });
                }}
              >
                Reject
              </Button>
            </div>
          </div>
        )}

        {awaitingEtransfer && (
          <div className="space-y-3 rounded-md border p-4">
            <p className="text-sm text-muted-foreground">
              After you receive the member&apos;s Interac e-Transfer in the
              bank inbox, confirm it here to activate their membership. This
              does not appear in Stripe.
            </p>
            <Button
              type="button"
              className="w-full"
              disabled={isPending}
              onClick={() => {
                setError(null);
                setMessage(null);
                const fd = new FormData();
                fd.set("token", token);
                startTransition(async () => {
                  const result = await confirmEtransferAction(fd);
                  if (result.ok) {
                    setPaid(true);
                    setMessage(result.message);
                  } else {
                    setError(result.message);
                  }
                });
              }}
            >
              {isPending
                ? "Working..."
                : "Mark Interac e-Transfer as received"}
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {message && (
          <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
