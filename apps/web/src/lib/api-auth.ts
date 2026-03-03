import { createHash } from "crypto";
import { db } from "@prefskit/db";
import { apiKeys } from "@prefskit/db/schema";
import { eq } from "drizzle-orm";

export async function authenticateApiKey(key: string) {
  const keyHash = createHash("sha256").update(key).digest("hex");
  const [apiKey] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);
  return apiKey ?? null;
}
