import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Categories", href: "/dashboard/categories" },
  { label: "Subscribers", href: "/dashboard/subscribers" },
  { label: "Suppressions", href: "/dashboard/suppressions" },
  { label: "API Keys", href: "/dashboard/api-keys" },
  { label: "Webhooks", href: "/dashboard/webhooks" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Settings", href: "/dashboard/settings" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <span className="font-bold text-lg text-indigo-400">PrefsKit</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="h-16 border-t border-gray-800 px-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-900 rounded-full flex items-center justify-center text-indigo-300 text-sm font-semibold">
            {session.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">
              {session.user?.name ?? "User"}
            </p>
            <p className="text-xs text-gray-500 truncate capitalize">
              {session.user?.plan ?? "free"} plan
            </p>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
