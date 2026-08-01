/**
 * Staff who can access /admin/applications and see the actionable-application counter.
 * Prefer JOCA_ADMIN_EMAILS (comma-separated). Falls back to JOCA_APPROVALS_EMAIL.
 */
export function getJocaAdminEmails(): string[] {
  const fromList = process.env.JOCA_ADMIN_EMAILS?.split(",") ?? [];
  const fromApprovals = process.env.JOCA_APPROVALS_EMAIL
    ? [process.env.JOCA_APPROVALS_EMAIL]
    : [];

  return [...fromList, ...fromApprovals]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isJocaAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getJocaAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(email.trim().toLowerCase());
}
