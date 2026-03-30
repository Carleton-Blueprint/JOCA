import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function GoodbyePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) redirect("/");
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Account deleted</CardTitle>
          <CardDescription>
            Your account has been permanently deleted. Thanks for being part of
            JOCA.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 sm:flex-row">
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/signup">Create new account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
