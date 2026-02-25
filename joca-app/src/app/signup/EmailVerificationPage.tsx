"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { sendVerificationEmail } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader } from "@/components/ui/loader";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import Loading from "../loading";
import { NotLoggedIn } from "@/components/NotLoggedIn";

const COOLDOWN_MS = 600_000; //10 minutes
const STORAGE_KEY = "verificationEmailSentAt";

const getSecondsRemaining = () => {
  const lastSent = localStorage.getItem(STORAGE_KEY);
  if (!lastSent) return 0;
  return Math.max(
    0,
    Math.ceil((COOLDOWN_MS - (Date.now() - parseInt(lastSent))) / 1000),
  );
};

export const EmailVerificationPage = ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => {
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    setCooldown(getSecondsRemaining());
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    setIsLoading(true);
    await sendVerificationEmail(
      { email, callbackURL: "/payment" },
      {
        onSuccess: () => {
          localStorage.setItem(STORAGE_KEY, Date.now().toString());
          setCooldown(COOLDOWN_MS / 1000);
          toast.success("Verification email sent.");
        },
        onError: (ctx) => {
          toast.error(
            ctx?.error?.message || "Failed to resend verification email.",
          );
        },
      },
    );
    setIsLoading(false);
  };

  if (isPending) return <Loading />;

  if (!session?.user) return <NotLoggedIn />;

  if (
    session?.user?.emailVerified &&
    process.env.NODE_ENV !== "development"
  ) {
    return (
      <div className="text-center text-muted-foreground flex flex-col items-center justify-center gap-4">
        Email verified already.
        <Button variant="outline" asChild>
          <Link href="/payment">Go to payment page</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-12">
      <CardContent>
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <h1 className="text-4xl font-bold text-center">Email Verification</h1>
          <p className="text-lg text-primary">Hello {name},</p>
          <p className="text-lg text-center">
            Thank you for signing up for JOCA. A verification email has been
            sent to your email address. It will expire in 10 minutes.
          </p>
          <p className="text-lg text-center">
            If you need to resend the verification email, please click the
            button below.
          </p>
          <Button
            variant="outline"
            className="cursor-pointer hover:bg-primary hover:text-white"
            onClick={handleResend}
            disabled={cooldown > 0 || isLoading}
          >
            {cooldown > 0 || isLoading ? (
              isLoading ? (
                <Loader />
              ) : (
                `Resend in ${cooldown}s`
              )
            ) : (
              "Resend Verification Email"
            )}
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 gap-4">
          <p className="text-lg text-muted-foreground">Thank you,</p>
          <p className="text-lg text-muted-foreground">The JOCA Team</p>
        </div>
      </CardContent>
    </Card>
  );
};
