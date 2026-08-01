export type EtransferInstructions = {
  email: string;
  notes: string | null;
  securityQuestion: string | null;
  securityAnswer: string | null;
};

/**
 * Interac e-Transfer destination for membership payments.
 * When unset, e-Transfer copy is omitted from member-facing UI/emails.
 */
export function getEtransferInstructions(): EtransferInstructions | null {
  const email = process.env.JOCA_ETRANSFER_EMAIL?.trim();
  if (!email) return null;

  const notes = process.env.JOCA_ETRANSFER_INSTRUCTIONS?.trim() || null;
  const securityQuestion =
    process.env.JOCA_ETRANSFER_SECURITY_QUESTION?.trim() || null;
  const securityAnswer =
    process.env.JOCA_ETRANSFER_SECURITY_ANSWER?.trim() || null;

  return { email, notes, securityQuestion, securityAnswer };
}
