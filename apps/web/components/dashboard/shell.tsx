"use client";

import { useState, createContext, useContext } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Menu } from "lucide-react";

// Context so DashboardHeader can trigger mobile sidebar from anywhere
interface ShellContextValue {
  openSidebar: () => void;
}

const ShellContext = createContext<ShellContextValue>({ openSidebar: () => {} });

export function useShell() {
  return useContext(ShellContext);
}

interface DashboardShellProps {
  children: React.ReactNode;
  workspaceName?: string;
  plan?: "free" | "starter" | "pro";
  userEmail?: string;
}

export function DashboardShell({
  children,
  workspaceName,
  plan,
  userEmail,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ShellContext.Provider value={{ openSidebar: () => setSidebarOpen(true) }}>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:w-60 lg:flex-shrink-0">
          <Sidebar workspaceName={workspaceName} plan={plan} userEmail={userEmail} />
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="relative z-10 flex h-full w-64 flex-col animate-slide-in">
              <Sidebar
                workspaceName={workspaceName}
                plan={plan}
                userEmail={userEmail}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </ShellContext.Provider>
  );
}

// Mobile-only hamburger button for use in DashboardHeader
export function MobileMenuButton() {
  const { openSidebar } = useShell();
  return (
    <button
      onClick={openSidebar}
      className="lg:hidden p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
