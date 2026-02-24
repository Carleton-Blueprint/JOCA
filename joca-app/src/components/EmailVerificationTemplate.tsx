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

interface EmailVerificationTemplateProps {
  username?: string;
  url: string;
}

export const EmailVerificationTemplate = ({
  username = "User",
  url,
}: EmailVerificationTemplateProps) => {
  const previewText = `Welcome to JOCA, ${username}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white m-auto font-sans">
          <Container className="mb-10 mx-auto p-5 max-w-[465px]">
            <Heading className="text-2xl text-black font-normal text-center p-0 my-8 mx-0">
              Welcome to <strong>JOCA</strong>, {username}!
            </Heading>
            <Text className="text-start text-sm text-black">
              Hello {username},
            </Text>
            <Text className="text-start text-sm text-black leading-relaxed">
              We're excited to have you onboard at <strong>JOCA</strong>. We
              hope you enjoy your journey with us. If you have any questions or
              need assistance, feel free to reach out.
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="py-2.5 px-5 bg-black rounded-md text-white text-sm font-semibold no-underline text-center"
                href={url}
              >
                Get Started
              </Button>
            </Section>
            <Text className="text-start text-sm text-black">
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

export default EmailVerificationTemplate;
