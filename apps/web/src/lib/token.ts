import { createHmac, timingSafeEqual } from "crypto";
import { env } from "./env";

export function signToken(email: string, workspaceId: string): string {
  const payload = `${email}:${workspaceId}`;
  const sig = createHmac("sha256", env.PREFSKIT_TOKEN_SECRET)
    .update(payload)
    .digest("hex");
  return Buffer.from(JSON.stringify({ email, workspaceId, sig })).toString(
    "base64url",
  );
}

export function verifyToken(
  token: string,
): { email: string; workspaceId: string } | null {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(token, "base64url").toString(),
    );
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("email" in parsed) ||
      !("workspaceId" in parsed) ||
      !("sig" in parsed)
    ) {
      return null;
    }
    const { email, workspaceId, sig } = parsed as {
      email: string;
      workspaceId: string;
      sig: string;
    };

    const expected = createHmac("sha256", env.PREFSKIT_TOKEN_SECRET)
      .update(`${email}:${workspaceId}`)
      .digest("hex");

    const valid =
      expected.length === sig.length &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(sig));

    return valid ? { email, workspaceId } : null;
  } catch {
    return null;
  }
}
