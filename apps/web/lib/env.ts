import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // NextAuth
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),

  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string().min(1, "GITHUB_CLIENT_ID is required"),
  GITHUB_CLIENT_SECRET: z.string().min(1, "GITHUB_CLIENT_SECRET is required"),

  // Email (Resend)
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, "STRIPE_WEBHOOK_SECRET is required"),
  STRIPE_INDIE_PRICE_ID: z
    .string()
    .min(1, "STRIPE_INDIE_PRICE_ID is required"),
  STRIPE_PRO_PRICE_ID: z.string().min(1, "STRIPE_PRO_PRICE_ID is required"),

  // PrefsKit
  PREFSKIT_TOKEN_SECRET: z
    .string()
    .min(32, "PREFSKIT_TOKEN_SECRET must be at least 32 characters"),

  // Optional
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

// Validate at module load time in server environments
let env: Env;

if (typeof window === "undefined") {
  // Only validate on the server
  try {
    env = validateEnv();
  } catch {
    // In build time, some env vars may not be set — use a lazy proxy
    env = new Proxy({} as Env, {
      get(_, prop) {
        const val = process.env[prop as string];
        if (!val) {
          throw new Error(
            `Environment variable ${String(prop)} is not set. Did you forget to add it to .env.local?`,
          );
        }
        return val;
      },
    });
  }
} else {
  env = {} as Env;
}

export { env };
export type { Env };
