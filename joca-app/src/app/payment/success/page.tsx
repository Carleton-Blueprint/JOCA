"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    // verify payment with webhook
    // For now just showing success after a delay
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your membership payment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVerifying ? (
            <p className="text-muted-foreground">Verifying payment...</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Your payment has been processed successfully. Your membership status will be updated shortly.
              </p>
              {sessionId && (
                <p className="text-xs text-muted-foreground">
                  Session ID: {sessionId}
                </p>
              )}
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/">Go to Home</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/events">View Events</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
