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
}: {
  token: string;
  applicant: Applicant;
  hasActiveSubscription: boolean;
}) {
  const [planId, setPlanId] = useState(
    applicant.approvedPlan ||
      applicant.requestedPlan ||
      MEMBERSHIP_PLANS[0].id,
  );
  const [status, setStatus] = useState(applicant.membershipStatus);
  const [message, setMessage] = useState<string | null>(
    isDecidedStatus(applicant.membershipStatus)
      ? "This application has already been decided. No further action is needed."
      : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const decided = isDecidedStatus(status);
  const controlsDisabled = isPending || decided;

  if (hasActiveSubscription) {
    return (
      <Card className="w-full max-w-xl mx-auto my-12">
        <CardHeader>
          <CardTitle>Already a member</CardTitle>
          <CardDescription>
            {applicant.firstName} {applicant.lastName} already has an active
            membership. No further action is needed.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl mx-auto my-12">
      <CardHeader>
        <CardTitle>Review membership application</CardTitle>
        <CardDescription>
          {decided
            ? "This application has already been reviewed."
            : "Confirm or change the membership type, then approve to email a Stripe payment link to the member."}
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

            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

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
                {isPending ? "Working..." : "Approve & email payment link"}
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

        {message && (
          <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
        )}
      </CardContent>
    </Card>
  );
}
