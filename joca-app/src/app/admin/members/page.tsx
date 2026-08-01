import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isJocaAdminEmail } from "@/lib/joca-admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MembersList } from "./MembersList";
import { MembersListFallback } from "./MembersListFallback";

async function MembersListContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login");
  if (!isJocaAdminEmail(session.user.email)) redirect("/");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query, mode: "insensitive" } },
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      requestedPlan: true,
      approvedPlan: true,
      membershipStatus: true,
      createdAt: true,
      subscription: { select: { status: true } },
    },
  });

  const members = users.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    requestedPlan: user.requestedPlan,
    approvedPlan: user.approvedPlan,
    membershipStatus: user.membershipStatus,
    createdAt: user.createdAt.toISOString(),
    subscriptionStatus: user.subscription?.status ?? null,
    isStaffAdmin: isJocaAdminEmail(user.email),
  }));

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-8 pb-8">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-end" method="get">
        <div className="flex-1 space-y-2">
          <label htmlFor="q" className="text-sm font-medium">
            Search by name or email
          </label>
          <Input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="e.g. jane@example.com"
          />
        </div>
        <Button type="submit" className="sm:w-auto">
          Search
        </Button>
      </form>

      {members.length === 0 ? (
        <p className="text-muted-foreground">
          {query ? "No members matched that search." : "No members found."}
        </p>
      ) : (
        <MembersList
          key={query || "all"}
          members={members}
          currentUserId={session.user.id}
          query={query}
        />
      )}
    </div>
  );
}

export default function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <main className="w-full flex flex-col gap-6">
      <header className="container mx-auto max-w-5xl space-y-2 px-8 pt-8">
        <h1 className="text-3xl font-bold">Members</h1>
        <p className="text-muted-foreground">
          Find members and permanently delete accounts (Stripe and app data).
          Prefer this over deleting rows in Supabase.
        </p>
        <p className="text-sm text-muted-foreground">
          <Link
            href="/admin/applications"
            className="underline underline-offset-2"
          >
            Back to applications
          </Link>
        </p>
      </header>
      <Suspense fallback={<MembersListFallback />}>
        <MembersListContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
