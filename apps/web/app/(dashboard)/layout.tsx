import { redirect } from "next/navigation";

/**
 * Dashboard layout with auth guard placeholder.
 * TODO: Replace with actual NextAuth session check once auth is wired up.
 */
async function getSession() {
  // Auth guard placeholder — will be replaced with:
  // const session = await getServerSession(authOptions);
  // For now, always return null (will redirect in dev unless bypassed)
  return null;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Uncomment when NextAuth is configured:
  // const session = await getSession();
  // if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="font-bold text-lg text-sky-600">PrefsKit</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Subscribers", href: "/dashboard/subscribers" },
            { label: "Categories", href: "/dashboard/categories" },
            { label: "API Keys", href: "/dashboard/api-keys" },
            { label: "Webhooks", href: "/dashboard/webhooks" },
            { label: "Settings", href: "/dashboard/settings" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* User footer */}
        <div className="h-16 border-t border-gray-200 px-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 text-sm font-semibold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">User</p>
            <p className="text-xs text-gray-500 truncate">Free plan</p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
