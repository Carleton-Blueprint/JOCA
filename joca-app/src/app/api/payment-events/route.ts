import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { paymentNotifications, notifyPaymentVerified } from "@/lib/payment-notifications";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Set up Server-Sent Events
    const stream = new ReadableStream({
        start(controller) {
            // Send initial connection message
            controller.enqueue(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`);

            // Check if user already has paid status
            if (session.user.hasPaid) {
                controller.enqueue(`data: ${JSON.stringify({ type: "payment_verified", hasPaid: true })}\n\n`);
                controller.close();
                return;
            }

            // Check if payment was already verified via notification
            if (paymentNotifications.get(userId)) {
                controller.enqueue(`data: ${JSON.stringify({ type: "payment_verified", hasPaid: true })}\n\n`);
                controller.close();
                return;
            }

            // Set up polling to check for payment updates
            const checkInterval = setInterval(async () => {
                try {
                    // Check if webhook has notified us via in-memory store
                    if (paymentNotifications.get(userId)) {
                        controller.enqueue(`data: ${JSON.stringify({ type: "payment_verified", hasPaid: true })}\n\n`);
                        controller.close();
                        clearInterval(checkInterval);
                        return;
                    }

                    // Also check the database directly as backup
                    const freshSession = await auth.api.getSession({
                        headers: await headers(),
                    });

                    if (freshSession?.user?.hasPaid) {
                        controller.enqueue(`data: ${JSON.stringify({ type: "payment_verified", hasPaid: true })}\n\n`);
                        controller.close();
                        clearInterval(checkInterval);
                        return;
                    }
                } catch (error) {
                    console.error("SSE check error:", error);
                }
            }, 2000); // Check every 2 seconds

            // Clean up after 2 minutes
            setTimeout(() => {
                controller.close();
                clearInterval(checkInterval);
            }, 120000);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    });
}

// Endpoint for webhook to notify about payment completion
export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return Response.json({ error: "userId required" }, { status: 400 });
        }

        notifyPaymentVerified(userId);

        return Response.json({ success: true });
    } catch (error) {
        console.error("Error processing notification:", error);
        return Response.json({ error: "Failed to process notification" }, { status: 500 });
    }
}