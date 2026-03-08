"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTypedSession } from "@/lib/auth-client";
import { NotLoggedIn } from "@/components/NotLoggedIn";
import Loading from "../../loading";

export default function PaymentSuccessPage() {
  const { data: session, isPending } = useTypedSession();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch by ensuring client-only rendering for dynamic content
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't run SSE on server

    // Use Server-Sent Events to listen for payment verification
    const eventSource = new EventSource("/api/payment-events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "payment_verified" && data.hasPaid) {
          setPaymentVerified(true);
          setIsVerifying(false);
          eventSource.close();
        }
      } catch (error) {
        console.error("SSE message parse error:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      setTimeout(() => {
        eventSource.close();
      }, 5000);
    };

    // Clean up on unmount
    return () => {
      eventSource.close();
    };
  }, [isClient]);

  // During SSR and initial render, show loading to prevent hydration mismatch
  if (isPending || !isClient) return <Loading />;

  if (!session?.user) return <NotLoggedIn />;

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
            <div className="space-y-2">
              <p className="text-muted-foreground">Waiting for payment confirmation...</p>
              <p className="text-xs text-gray-500">This should happen within a few seconds</p>
            </div>
          ) : paymentVerified ? (
            <>
              <p className="text-sm text-green-600 font-medium">
                Payment verified! Your membership is now active.
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
          ) : (
            <>
              <p className="text-sm text-amber-600">
                Payment processing may be delayed.
              </p>
              <p className="text-sm text-muted-foreground">
                Your payment has been processed successfully. Your membership
                status should be updated shortly. If not, please contact support.
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
