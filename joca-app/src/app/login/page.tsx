import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Loading from "../loading";

/** Only same-origin relative paths (blocks open redirects). */
function safeRedirectPath(value: string | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

async function LoginGate({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectParam } = await searchParams;
  const afterLogin = safeRedirectPath(redirectParam) ?? "/";

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) redirect(afterLogin);

  return <LoginForm redirectTo={afterLogin} />;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <Suspense fallback={<Loading />}>
      <LoginGate searchParams={searchParams} />
    </Suspense>
  );
}
