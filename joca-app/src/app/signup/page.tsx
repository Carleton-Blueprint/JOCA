import { Suspense } from "react";
import { SignupForm } from "./SignupForm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Loading from "../loading";

async function SignupGate() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) redirect("/");

  return <SignupForm />;
}

export default function SignupPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SignupGate />
    </Suspense>
  );
}
