import { createHmac, timingSafeEqual } from "crypto";

const PURPOSE = "membership-approve";
/** Approve/reject links only — e-Transfer confirm is session-admin on /admin/applications. */
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET is not set");
  }
  return secret;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createMembershipApprovalToken(userId: string): string {
  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = `${PURPOSE}:${userId}:${exp}`;
  const sig = signPayload(payload);
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyMembershipApprovalToken(
  token: string,
): { userId: string } | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 4) return null;

    const [purpose, userId, expStr, sig] = parts;
    if (purpose !== PURPOSE || !userId || !expStr || !sig) return null;

    const exp = Number(expStr);
    if (!Number.isFinite(exp) || Date.now() > exp) return null;

    const payload = `${purpose}:${userId}:${expStr}`;
    const expected = signPayload(payload);

    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}

export function getApproveMembershipUrl(userId: string): string {
  const base =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    "http://localhost:3000";
  const token = createMembershipApprovalToken(userId);
  return `${base.replace(/\/$/, "")}/admin/approve-membership?token=${encodeURIComponent(token)}`;
}
