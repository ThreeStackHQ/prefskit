export const metadata = {
  title: "Dashboard — PrefsKit",
};

const stats = [
  { label: "Total Subscribers", value: "—", change: null },
  { label: "Active Preferences", value: "—", change: null },
  { label: "Suppressions", value: "—", change: null },
  { label: "API Calls (30d)", value: "—", change: null },
];

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your email preference center
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick start */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-6">
        <h2 className="font-semibold text-sky-900 mb-2">
          🚀 Get started in 3 steps
        </h2>
        <ol className="space-y-2 text-sm text-sky-800">
          <li>
            1. Create your first{" "}
            <a href="/dashboard/categories" className="underline font-medium">
              email categories
            </a>{" "}
            (e.g. &quot;Marketing&quot;, &quot;Product updates&quot;)
          </li>
          <li>
            2. Generate an{" "}
            <a href="/dashboard/api-keys" className="underline font-medium">
              API key
            </a>{" "}
            and install the SDK:{" "}
            <code className="bg-sky-100 px-1 rounded">
              pnpm add @prefskit/sdk
            </code>
          </li>
          <li>
            3. Call{" "}
            <code className="bg-sky-100 px-1 rounded">
              prefskit.canSend(email, &apos;marketing&apos;)
            </code>{" "}
            before sending
          </li>
        </ol>
      </div>
    </div>
  );
}
