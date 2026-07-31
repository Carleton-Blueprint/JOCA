export const MEMBERSHIP_PLANS = [
  { id: "senior-membership", label: "Senior Membership" },
  { id: "general-membership", label: "General Membership" },
  { id: "family-membership", label: "Family Membership" },
  {
    id: "student-associate-membership",
    label: "Student / Associate Membership",
  },
] as const;

export type MembershipPlanId = (typeof MEMBERSHIP_PLANS)[number]["id"];

export const MEMBERSHIP_PLAN_IDS = MEMBERSHIP_PLANS.map((p) => p.id);

export const MEMBERSHIP_STATUS = {
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type MembershipStatus =
  (typeof MEMBERSHIP_STATUS)[keyof typeof MEMBERSHIP_STATUS];

export function isMembershipPlanId(value: string): value is MembershipPlanId {
  return (MEMBERSHIP_PLAN_IDS as readonly string[]).includes(value);
}

export function getPlanLabel(planId: string | null | undefined): string {
  if (!planId) return "Unknown plan";
  return MEMBERSHIP_PLANS.find((p) => p.id === planId)?.label ?? planId;
}
