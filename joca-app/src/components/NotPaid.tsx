import { Button } from "@/components/ui/button";
import Link from "next/link";

export const NotPaid = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4">
            <p className="text-center text-xl">Membership Required</p>
            <p className="text-center text-muted-foreground">
                You need an active membership to access elections.
            </p>
            <Button asChild>
                <Link href="/payment">Become a Member</Link>
            </Button>
        </div>
    );
};