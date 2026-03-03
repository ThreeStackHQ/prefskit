"use client";

import { Bell } from "lucide-react";
import { MobileMenuButton } from "@/components/dashboard/shell";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function DashboardHeader({ title, description, actions }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-4 backdrop-blur-sm lg:px-6">
      {/* Mobile hamburger */}
      <MobileMenuButton />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-slate-100 truncate">{title}</h1>
        {description && (
          <p className="text-xs text-slate-500 hidden sm:block">{description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {actions}
        <button className="relative p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
