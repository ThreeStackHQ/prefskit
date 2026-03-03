import { SignJWT, jwtVerify } from "jose";

interface SubscriberTokenPayload {
  email: string;
  workspaceId: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.PREFSKIT_TOKEN_SECRET;
  if (!secret) throw new Error("PREFSKIT_TOKEN_SECRET is not set");
  return new TextEncoder().encode(secret);
}

/**
 * Sign a subscriber preference token (valid for 30 days)
 */
export async function signSubscriberToken(
  payload: SubscriberTokenPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

/**
 * Verify and decode a subscriber preference token
 */
export async function verifySubscriberToken(
  token: string,
): Promise<SubscriberTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.email === "string" &&
      typeof payload.workspaceId === "string"
    ) {
      return { email: payload.email, workspaceId: payload.workspaceId };
    }
    return null;
  } catch {
    return null;
  }
}
