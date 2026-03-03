import type { Metadata } from "next";
import { ApiKeysManager } from "./api-keys-manager";

export const metadata: Metadata = { title: "API Keys" };

// TODO: Fetch from GET /api/api-keys once Bolt's API is ready
async function getApiKeys() {
  return [];
}

export default async function ApiKeysPage() {
  const keys = await getApiKeys();
  return <ApiKeysManager initialKeys={keys} />;
}
