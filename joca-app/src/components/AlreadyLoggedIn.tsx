import { Button } from "@/components/ui/button";
import Link from "next/link";

export const AlreadyLoggedIn = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4">
      <p className="text-center text-xl">Already logged in</p>
      <Button variant="outline" asChild>
        <Link href="/">Go to Home</Link>
      </Button>
    </div>
  );
};
