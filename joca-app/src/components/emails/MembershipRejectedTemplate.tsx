import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";

interface MembershipRejectedTemplateProps {
  username: string;
}

export const MembershipRejectedTemplate = ({
  username,
}: MembershipRejectedTemplateProps) => {
  const previewText = `Update on your JOCA membership application`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white m-auto font-sans">
          <Container className="mb-10 mx-auto p-5 max-w-[465px]">
            <Heading className="text-2xl text-black font-normal text-center p-0 my-8 mx-0">
              Membership application update
            </Heading>
            <Text className="text-sm text-black leading-relaxed">
              Hello {username},
            </Text>
            <Text className="text-sm text-black leading-relaxed">
              Thank you for your interest in JOCA. After review, we are unable
              to approve your membership application at this time. If you
              believe this is a mistake, please contact JOCA directly.
            </Text>
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

export default MembershipRejectedTemplate;
