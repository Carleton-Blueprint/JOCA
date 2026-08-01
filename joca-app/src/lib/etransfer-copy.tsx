import type { ReactNode } from "react";

/** Shared Interac security-question line with bold question/answer values. */
export function formatEtransferSecurityLine(params: {
  securityQuestion: string | null | undefined;
  securityAnswer: string | null | undefined;
  notes?: string | null;
  strong: (children: ReactNode) => ReactNode;
}): ReactNode | null {
  const { securityQuestion, securityAnswer, notes, strong } = params;

  if (securityQuestion && securityAnswer) {
    return (
      <>
        Use security question: {strong(securityQuestion)} / answer:{" "}
        {strong(securityAnswer)}
        {notes ? <> / {notes}</> : null}
      </>
    );
  }

  if (notes) return notes;
  return null;
}
