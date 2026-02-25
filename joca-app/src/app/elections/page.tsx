import { ElectionCards } from "./ElectionCards";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { headers } from "next/headers";

export default async function ElectionsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4">
        <p className="text-center text-xl">Not logged in</p>
        <Button variant="outline" asChild>
          <Link href="/login">Go to Login</Link>
        </Button>
      </div>
    );
  }

  return <ElectionCards />;
}
