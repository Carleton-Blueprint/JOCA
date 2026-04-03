import { EmailVerification } from "./EmailVerificationPage";

interface Props {
  searchParams: Promise<{ name?: string; email?: string }>;
}

export default async function EmailVerificationPage({ searchParams }: Props) {
  const { name, email } = await searchParams;

  return <EmailVerification name={name ?? ""} email={email ?? ""} />;
}
