import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Loading from "../loading";

async function LoginGate() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) redirect("/");

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginGate />
    </Suspense>
  );
}
