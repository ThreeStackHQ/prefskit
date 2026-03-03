import { type NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { db } from "@prefskit/db";
import { workspaces, workspaceMembers, users, accounts } from "@prefskit/db";
import { eq, and } from "@prefskit/db";

export const authOptions: NextAuthOptions = {
  // No adapter — full JWT strategy, we persist manually in signIn callback
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      try {
        // Upsert user
        let dbUser = await db.query.users.findFirst({
          where: eq(users.email, user.email),
        });

        if (!dbUser) {
          const [created] = await db
            .insert(users)
            .values({
              name: user.name,
              email: user.email,
              image: user.image,
            })
            .returning();
          dbUser = created;
        }

        if (!dbUser) return false;

        // Upsert OAuth account link
        if (account) {
          const existingAccount = await db.query.accounts.findFirst({
            where: and(
              eq(accounts.provider, account.provider),
              eq(accounts.providerAccountId, account.providerAccountId),
            ),
          });

          if (!existingAccount) {
            await db.insert(accounts).values({
              userId: dbUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              refreshToken: account.refresh_token,
              accessToken: account.access_token,
              expiresAt: account.expires_at,
              tokenType: account.token_type,
              scope: account.scope,
              idToken: account.id_token,
            });
          }
        }

        // Auto-create workspace on first sign-in
        const existingMembership = await db.query.workspaceMembers.findFirst({
          where: eq(workspaceMembers.userId, dbUser.id),
        });

        if (!existingMembership) {
          const baseSlug = user.email
            .split("@")[0]!
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, "-")
            .slice(0, 40);
          const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

          const [workspace] = await db
            .insert(workspaces)
            .values({
              name: user.name ?? user.email,
              slug,
              plan: "free",
            })
            .returning();

          if (workspace) {
            await db.insert(workspaceMembers).values({
              workspaceId: workspace.id,
              userId: dbUser.id,
              role: "owner",
            });
          }
        }

        // Store dbUser.id in user object for JWT callback
        user.id = dbUser.id;
      } catch (err) {
        console.error("signIn error:", err);
        return false;
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId && session.user) {
        session.user.id = token.userId as string;

        try {
          const membership = await db.query.workspaceMembers.findFirst({
            where: eq(workspaceMembers.userId, token.userId as string),
            with: { workspace: true },
          });

          if (membership) {
            session.user.workspaceId = membership.workspace.id;
            session.user.plan = membership.workspace.plan;
          }
        } catch (err) {
          console.error("session callback error:", err);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

// Augment next-auth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      workspaceId?: string;
      plan?: "free" | "indie" | "pro";
    };
  }

  interface User {
    id: string;
  }
}
