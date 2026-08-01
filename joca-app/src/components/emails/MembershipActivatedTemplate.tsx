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

interface MembershipActivatedTemplateProps {
  username: string;
  planLabel: string;
}

export const MembershipActivatedTemplate = ({
  username,
  planLabel,
}: MembershipActivatedTemplateProps) => {
  const previewText = `Your JOCA membership is now active`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white m-auto font-sans">
          <Container className="mb-10 mx-auto p-5 max-w-[465px]">
            <Heading className="text-2xl text-black font-normal text-center p-0 my-8 mx-0">
              Membership activated
            </Heading>
            <Text className="text-sm text-black leading-relaxed">
              Hello {username},
            </Text>
            <Text className="text-sm text-black leading-relaxed">
              We received your Interac e-Transfer. Your{" "}
              <strong>{planLabel}</strong> membership is now active. You can
              sign in to access elections and other member features.
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

export default MembershipActivatedTemplate;
