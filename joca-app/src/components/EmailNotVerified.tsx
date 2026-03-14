import { Button } from "@/components/ui/button";
import Link from "next/link";

export const EmailNotVerified = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4">
      <p className="text-center text-xl">Email Not Verified</p>
      <p className="text-center text-muted-foreground">
        Please verify your email address to access this page.
      </p>
      <Button variant="outline" asChild>
        <Link href="/email-verification">Verify Email</Link>
      </Button>
    </div>
  );
};
