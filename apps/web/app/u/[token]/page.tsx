import { notFound } from "next/navigation";

interface PrefsPageProps {
  params: { token: string };
}

/**
 * Public email preferences page — /u/[token]
 *
 * The token is a signed JWT (using PREFSKIT_TOKEN_SECRET) that contains:
 * - sub: subscriber email
 * - wid: workspace ID
 * - exp: expiry (optional)
 *
 * This page is SSR — it validates the token server-side and renders
 * the subscriber's current preferences.
 *
 * TODO: Wire up DB lookup + token validation once auth/db is ready.
 */

// Stub: simulate token validation
async function resolveToken(_token: string) {
  // Will call: verifyToken(token, env.PREFSKIT_TOKEN_SECRET)
  // Returns: { email, workspaceId } or null
  return null;
}

export default async function PrefsPage({ params }: PrefsPageProps) {
  const { token } = params;

  const subscriber = await resolveToken(token);

  if (!subscriber) {
    // In production: differentiate between expired vs invalid
    notFound();
  }

  // This block is unreachable until token validation is implemented
  // but keeps the UI structure visible for design purposes.
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Email Preferences
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage what emails you receive
          </p>
        </div>

        {/* Preferences card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
          {/* Category stub */}
          {["Marketing & news", "Product updates", "Tips & tutorials"].map(
            (category) => (
              <div
                key={category}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {category}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Category description goes here
                  </p>
                </div>
                {/* Toggle placeholder */}
                <div className="w-10 h-6 bg-sky-500 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            ),
          )}
        </div>

        {/* Unsubscribe all */}
        <div className="text-center">
          <button
            type="button"
            className="text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
          >
            Unsubscribe from all emails
          </button>
        </div>
      </div>
    </div>
  );
}
