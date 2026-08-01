"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  getPlanLabel,
  getMembershipStatusLabel,
} from "@/lib/membership-plans";
import { adminDeleteUserAction } from "./actions";

export type MemberCardData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  requestedPlan: string | null;
  approvedPlan: string | null;
  membershipStatus: string;
  createdAt: string;
  subscriptionStatus: string | null;
  isStaffAdmin: boolean;
};

export function MemberCard({
  member,
  isSelf,
}: {
  member: MemberCardData;
  isSelf: boolean;
}) {
  const [deleted, setDeleted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const memberName = `${member.firstName} ${member.lastName}`;

  if (deleted) {
    return (
      <Card className="opacity-70">
        <CardHeader>
          <CardTitle className="text-lg">{memberName}</CardTitle>
          <CardDescription>Account deleted</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <p className="text-sm text-green-700 dark:text-green-400">
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const canDelete = !isSelf && !member.isStaffAdmin;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{memberName}</CardTitle>
        <CardDescription>
          Joined {new Date(member.createdAt).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <dl className="space-y-2">
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium break-all">{member.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="font-medium">{member.phoneNumber}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Membership status</dt>
            <dd className="font-medium">
              {getMembershipStatusLabel(member.membershipStatus)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Plan</dt>
            <dd className="font-medium">
              {getPlanLabel(member.approvedPlan || member.requestedPlan)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Subscription</dt>
            <dd className="font-medium">
              {member.subscriptionStatus ?? "None"}
            </dd>
          </div>
        </dl>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {message && (
          <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
        )}
        {isSelf && (
          <p className="text-sm text-muted-foreground">
            This is your account. Use Account settings to delete it.
          </p>
        )}
        {member.isStaffAdmin && !isSelf && (
          <p className="text-sm text-muted-foreground">
            Staff admin accounts cannot be deleted here.
          </p>
        )}
      </CardContent>
      {canDelete && (
        <CardFooter>
          <Button
            variant="destructive"
            className="w-full"
            disabled={isPending}
            onClick={() => setConfirmOpen(true)}
          >
            {isPending ? "Deleting..." : "Delete account"}
          </Button>
        </CardFooter>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this member?</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete {memberName} ({member.email})? This cancels
              Stripe billing, removes the Stripe customer, and removes all app
              data. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                const fd = new FormData();
                fd.set("userId", member.id);
                setError(null);
                setMessage(null);
                startTransition(async () => {
                  const result = await adminDeleteUserAction(fd);
                  if (result.ok) {
                    setDeleted(true);
                    setMessage(result.message);
                  } else {
                    setError(result.message);
                  }
                });
                setConfirmOpen(false);
              }}
            >
              Yes, delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
