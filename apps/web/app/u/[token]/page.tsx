import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PrefsPageClient } from "./prefs-client";

interface PrefsPageProps {
  params: { token: string };
}

interface TokenPayload {
  email: string;
  workspaceId: string;
}

interface WorkspaceBranding {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
}

interface Category {
  id: string;
  slug: string;
  label: string;
  description: string;
  required: boolean;
}

interface SubscriberPreferences {
  [categorySlug: string]: boolean;
}

/**
 * Decode and verify the JWT token server-side.
 * TODO: Replace with real jose.jwtVerify() call once PREFSKIT_TOKEN_SECRET is configured.
 */
async function verifyToken(token: string): Promise<TokenPayload | null> {
  // Stub: in production, use:
  // import { jwtVerify } from 'jose'
  // const secret = new TextEncoder().encode(process.env.PREFSKIT_TOKEN_SECRET)
  // const { payload } = await jwtVerify(token, secret)
  // return { email: payload.sub as string, workspaceId: payload.wid as string }

  // For now: decode without verification (DEV ONLY - replace before launch)
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1]!, "base64url").toString("utf-8"),
    );
    if (payload.exp && payload.exp < Date.now() / 1000) return null;
    if (!payload.sub || !payload.wid) return null;
    return { email: payload.sub as string, workspaceId: payload.wid as string };
  } catch {
    return null;
  }
}

/**
 * Load workspace branding for the public preferences page.
 * TODO: Fetch from GET /api/public/workspace/:id once Bolt's API is ready.
 */
async function getWorkspaceBranding(workspaceId: string): Promise<WorkspaceBranding> {
  // Stub data
  void workspaceId;
  return {
    name: "My SaaS App",
    logoUrl: null,
    primaryColor: "#4f46e5",
  };
}

/**
 * Load categories for the workspace.
 * TODO: Fetch from GET /api/public/categories/:workspaceId once Bolt's API is ready.
 */
async function getCategories(workspaceId: string): Promise<Category[]> {
  void workspaceId;
  return [
    {
      id: "1",
      slug: "marketing",
      label: "Marketing & Announcements",
      description: "Product launches, company news, and special offers",
      required: false,
    },
    {
      id: "2",
      slug: "product-updates",
      label: "Product Updates",
      description: "New features, improvements, and changelogs",
      required: false,
    },
    {
      id: "3",
      slug: "transactional",
      label: "Transactional",
      description: "Account notifications, receipts, and security alerts",
      required: true,
    },
  ];
}

/**
 * Load subscriber's current preferences.
 * TODO: Fetch from GET /api/public/preferences/:email/:workspaceId once Bolt's API is ready.
 */
async function getSubscriberPreferences(
  email: string,
  workspaceId: string,
): Promise<SubscriberPreferences> {
  void email;
  void workspaceId;
  return {
    marketing: true,
    "product-updates": true,
    transactional: true,
  };
}

export async function generateMetadata({ params }: PrefsPageProps): Promise<Metadata> {
  return {
    title: "Email Preferences",
    description: "Manage your email preferences",
    robots: { index: false, follow: false },
  };
}

export default async function PrefsPage({ params }: PrefsPageProps) {
  const { token } = params;

  const payload = await verifyToken(token);
  if (!payload) {
    notFound();
  }

  const [branding, categories, preferences] = await Promise.all([
    getWorkspaceBranding(payload.workspaceId),
    getCategories(payload.workspaceId),
    getSubscriberPreferences(payload.email, payload.workspaceId),
  ]);

  return (
    <PrefsPageClient
      token={token}
      email={payload.email}
      branding={branding}
      categories={categories}
      initialPreferences={preferences}
    />
  );
}
