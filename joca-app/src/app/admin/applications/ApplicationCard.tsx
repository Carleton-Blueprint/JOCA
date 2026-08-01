"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MEMBERSHIP_PLANS,
  MEMBERSHIP_STATUS,
  getPlanLabel,
  getMembershipStatusLabel,
} from "@/lib/membership-plans";
import {
  adminApproveApplicationAction,
  adminConfirmEtransferAction,
  adminRejectApplicationAction,
} from "./actions";

type ConfirmAction = "approve" | "reject";

export type ApplicationCardData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  requestedPlan: string | null;
  approvedPlan: string | null;
  membershipStatus: string;
  createdAt: string;
  hasActiveSubscription: boolean;
};

export function ApplicationCard({
  applicant,
  etransferEnabled,
}: {
  applicant: ApplicationCardData;
  etransferEnabled: boolean;
}) {
  const [planId, setPlanId] = useState(
    applicant.approvedPlan ||
      applicant.requestedPlan ||
      MEMBERSHIP_PLANS[0].id,
  );
  const [status, setStatus] = useState(applicant.membershipStatus);
  const [paid, setPaid] = useState(applicant.hasActiveSubscription);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>("approve");
  const [isPending, startTransition] = useTransition();
  const applicantName = `${applicant.firstName} ${applicant.lastName}`;

  const openConfirm = (action: ConfirmAction) => {
    setConfirmAction(action);
    setConfirmOpen(true);
  };

  const pendingReview = status === MEMBERSHIP_STATUS.PENDING_APPROVAL;
  const awaitingPayment =
    !paid && status === MEMBERSHIP_STATUS.APPROVED;

  const runAction = (
    action: () => Promise<{ ok: boolean; message: string }>,
    onOk: () => void,
  ) => {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        onOk();
        setMessage(result.message);
      } else {
        setError(result.message);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {applicant.firstName} {applicant.lastName}
        </CardTitle>
        <CardDescription>
          Applied {new Date(applicant.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="space-y-2">
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium break-all">{applicant.email}</dd>
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
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium">{getMembershipStatusLabel(status)}</dd>
          </div>
          {status === MEMBERSHIP_STATUS.APPROVED && (
            <div>
              <dt className="text-muted-foreground">Approved plan</dt>
              <dd className="font-medium">{getPlanLabel(planId)}</dd>
            </div>
          )}
        </dl>

        {pendingReview && (
          <div className="space-y-2">
            <Label htmlFor={`plan-${applicant.id}`}>
              Membership type to approve
            </Label>
            <Select
              value={planId}
              onValueChange={setPlanId}
              disabled={isPending}
            >
              <SelectTrigger id={`plan-${applicant.id}`} className="w-full">
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
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {message && (
          <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        {pendingReview && (
          <>
            <Button
              className="flex-1"
              disabled={isPending}
              onClick={() => openConfirm("approve")}
            >
              {isPending ? "Working..." : "Approve"}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled={isPending}
              onClick={() => openConfirm("reject")}
            >
              Reject
            </Button>
          </>
        )}
        {awaitingPayment && etransferEnabled && (
          <Button
            className="w-full"
            disabled={isPending}
            onClick={() => {
              const fd = new FormData();
              fd.set("userId", applicant.id);
              runAction(
                () => adminConfirmEtransferAction(fd),
                () => setPaid(true),
              );
            }}
          >
            {isPending ? "Working..." : "Mark Interac e-Transfer received"}
          </Button>
        )}
        {awaitingPayment && !etransferEnabled && (
          <p className="text-sm text-muted-foreground">
            Waiting for the member to complete card payment.
          </p>
        )}
        {paid && (
          <p className="text-sm text-muted-foreground">Membership is active.</p>
        )}
        {status === MEMBERSHIP_STATUS.REJECTED && !message && (
          <p className="text-sm text-muted-foreground">Application rejected.</p>
        )}
      </CardFooter>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === "approve"
                ? "Approve this application?"
                : "Reject this application?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === "approve" ? (
                <>
                  Approve {applicantName} for{" "}
                  <strong>{getPlanLabel(planId)}</strong>? They will be emailed
                  payment options.
                </>
              ) : (
                <>
                  Reject {applicantName}&apos;s application? They will be
                  notified by email. This cannot be undone from this screen.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={confirmAction === "reject" ? "destructive" : "default"}
              disabled={isPending}
              onClick={() => {
                if (confirmAction === "approve") {
                  const fd = new FormData();
                  fd.set("userId", applicant.id);
                  fd.set("planId", planId);
                  runAction(
                    () => adminApproveApplicationAction(fd),
                    () => setStatus(MEMBERSHIP_STATUS.APPROVED),
                  );
                } else {
                  const fd = new FormData();
                  fd.set("userId", applicant.id);
                  runAction(
                    () => adminRejectApplicationAction(fd),
                    () => setStatus(MEMBERSHIP_STATUS.REJECTED),
                  );
                }
                setConfirmOpen(false);
              }}
            >
              {confirmAction === "approve" ? "Approve" : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
