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

interface MembershipApplicationStaffTemplateProps {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  requestedPlanLabel: string;
  approveUrl: string;
}

export const MembershipApplicationStaffTemplate = ({
  firstName,
  lastName,
  email,
  phoneNumber,
  requestedPlanLabel,
  approveUrl,
}: MembershipApplicationStaffTemplateProps) => {
  const previewText = `New JOCA membership application from ${firstName} ${lastName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white m-auto font-sans">
          <Container className="mb-10 mx-auto p-5 max-w-[465px]">
            <Heading className="text-2xl text-black font-normal text-center p-0 my-8 mx-0">
              New membership application
            </Heading>
            <Text className="text-sm text-black leading-relaxed">
              A new member has verified their email and is awaiting approval.
            </Text>
            <Text className="text-sm text-black leading-relaxed">
              <strong>Name:</strong> {firstName} {lastName}
              <br />
              <strong>Email:</strong> {email}
              <br />
              <strong>Phone:</strong> {phoneNumber}
              <br />
              <strong>Requested plan:</strong> {requestedPlanLabel}
            </Text>
            <Text className="text-sm text-black leading-relaxed">
              Open the link below to approve or reject. You can change the
              membership type before approving.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="py-2.5 px-5 bg-black rounded-md text-white text-sm font-semibold no-underline text-center"
                href={approveUrl}
              >
                Review application
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default MembershipApplicationStaffTemplate;
