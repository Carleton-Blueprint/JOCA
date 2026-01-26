ADR 0004: Payment Processing Integration
Status: Accepted

Context: Members must pay membership dues.

Decision: Standardized on Stripe API.

Rationale: Stripe provides Stripe Checkout, which keeps the payment UI on our own domain (improving trust) and supports Apple Pay/Google Pay. This significantly reduces friction for mobile users. Additionally, Stripe’s Webhook system ensures that member status is updated in our database even if the user closes their browser mid-transaction.

Consequences: We must implement robust webhook error-handling and idempotency to ensure no member is charged twice or granted status without a successful payment.
