"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Tag,
  ShieldOff,
  Key,
  Settings,
  CreditCard,
  LogOut,
  Zap,
  X,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Subscribers", href: "/dashboard/subscribers", icon: Users },
  { label: "Categories", href: "/dashboard/categories", icon: Tag },
  { label: "Suppressions", href: "/dashboard/suppressions", icon: ShieldOff },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Widget Preview", href: "/dashboard/widget-preview", icon: Eye },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

interface SidebarProps {
  workspaceName?: string;
  plan?: "free" | "starter" | "pro";
  userEmail?: string;
  onClose?: () => void;
}

const planBadge: Record<string, { label: string; variant: "default" | "indigo" | "success" }> = {
  free: { label: "Free", variant: "default" },
  starter: { label: "Starter", variant: "indigo" },
  pro: { label: "Pro", variant: "success" },
};

export function Sidebar({
  workspaceName = "My Workspace",
  plan = "free",
  userEmail = "user@example.com",
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const badge = planBadge[plan] ?? planBadge.free;

  return (
    <aside className="flex h-full flex-col bg-slate-900 border-r border-slate-800">
      {/* Logo + Close (mobile) */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-white tracking-tight">PrefsKit</span>
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Workspace header */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-200 truncate">{workspaceName}</p>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-indigo-600/15 text-indigo-300 border border-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800",
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-400" : "")}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-300 text-sm font-semibold ring-1 ring-indigo-500/30">
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{userEmail}</p>
            <p className="text-xs text-slate-500 capitalize">{plan} plan</p>
          </div>
          <button
            className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
