// Shared in-memory store for payment notifications
// In production, use Redis or a database instead
export const paymentNotifications = new Map<string, boolean>();

export function notifyPaymentVerified(userId: string) {
    paymentNotifications.set(userId, true);

    // Clean up after 5 minutes
    setTimeout(() => {
        paymentNotifications.delete(userId);
    }, 300000);
}