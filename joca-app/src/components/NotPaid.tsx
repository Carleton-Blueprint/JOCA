import { Button } from "@/components/ui/button";
import Link from "next/link";

export const NotPaid = ({
  href = "/pending",
  title = "Membership required",
  description = "You need an active JOCA membership to access this page.",
  cta = "Check application status",
}: {
  href?: string;
  title?: string;
  description?: string;
  cta?: string;
} = {}) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4">
      <p className="text-center text-xl">{title}</p>
      <p className="text-center text-muted-foreground">{description}</p>
      <Button asChild>
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
};
