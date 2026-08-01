import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface MembershipApprovedTemplateProps {
  username: string;
  planLabel: string;
  checkoutUrl: string;
  etransferEmail?: string | null;
  etransferNotes?: string | null;
}

export const MembershipApprovedTemplate = ({
  username,
  planLabel,
  checkoutUrl,
  etransferEmail,
  etransferNotes,
}: MembershipApprovedTemplateProps) => {
  const previewText = `Your JOCA membership application was approved`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white m-auto font-sans">
          <Container className="mb-10 mx-auto p-5 max-w-[465px]">
            <Heading className="text-2xl text-black font-normal text-center p-0 my-8 mx-0">
              Membership approved
            </Heading>
            <Text className="text-sm text-black leading-relaxed">
              Hello {username},
            </Text>
            <Text className="text-sm text-black leading-relaxed">
              Your JOCA membership application has been approved for{" "}
              <strong>{planLabel}</strong>. Complete payment using one of the
              options below to activate your membership.
            </Text>

            <Text className="text-sm text-black font-semibold leading-relaxed">
              Option 1 — Pay by card (Stripe)
            </Text>
            <Section className="text-center mt-[16px] mb-[24px]">
              <Button
                className="py-2.5 px-5 bg-black rounded-md text-white text-sm font-semibold no-underline text-center"
                href={checkoutUrl}
              >
                Complete card payment
              </Button>
            </Section>
            <Text className="text-sm text-black leading-relaxed">
              If the button does not work, copy and paste this link into your
              browser:
              <br />
              {checkoutUrl}
            </Text>

            {etransferEmail && (
              <>
                <Text className="text-sm text-black font-semibold leading-relaxed mt-6">
                  Option 2 — Interac e-Transfer
                </Text>
                <Text className="text-sm text-black leading-relaxed">
                  Send an Interac e-Transfer for your{" "}
                  <strong>{planLabel}</strong> to:
                  <br />
                  <strong>{etransferEmail}</strong>
                </Text>
                {etransferNotes && (
                  <Text className="text-sm text-black leading-relaxed">
                    {etransferNotes}
                  </Text>
                )}
                <Text className="text-sm text-black leading-relaxed">
                  Include your full name and this email address in the message
                  so we can match your payment. Access is activated after JOCA
                  confirms receipt (this is not automatic).
                </Text>
              </>
            )}

            <Text className="text-sm text-black">
              Cheers,
              <br />
              The JOCA Team
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MembershipApprovedTemplate;
