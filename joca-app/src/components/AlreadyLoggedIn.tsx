import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTypedSession } from "@/lib/auth-client";
import { IconCheck } from "@tabler/icons-react";

export const AlreadyLoggedIn = () => {
  const { data: session } = useTypedSession();

  const hasPaid = session?.user?.hasPaid;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4">
      <div className="flex items-center gap-2">
        <p className="text-center text-xl">Already logged in</p>
        {hasPaid && (
          <IconCheck className="w-6 h-6 text-green-600" />
        )}
      </div>
      {hasPaid && (
        <p className="text-center text-green-600 font-medium">
          Payment completed successfully!
        </p>
      )}
      <Button variant="outline" asChild>
        <Link href="/">Go to Home</Link>
      </Button>
    </div>
  );
};
