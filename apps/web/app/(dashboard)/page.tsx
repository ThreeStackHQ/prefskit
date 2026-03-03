import type { Metadata } from "next";
import { Users, ShieldOff, Tag, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";

export const metadata: Metadata = {
  title: "Dashboard",
};

// TODO: Replace with real API calls once Bolt's backend is ready
async function getDashboardStats() {
  return {
    totalSubscribers: 0,
    suppressionRate: 0,
    activeCategories: 0,
    canSendChecks: 0,
    isEmpty: true,
  };
}

const gettingStartedSteps = [
  {
    step: 1,
    title: "Create email categories",
    description: 'Define groups like "Marketing", "Product updates", "Transactional"',
    href: "/dashboard/categories",
    cta: "Add categories",
  },
  {
    step: 2,
    title: "Generate an API key",
    description: "Get your key and install the SDK: pnpm add @prefskit/sdk",
    href: "/dashboard/api-keys",
    cta: "Create API key",
  },
  {
    step: 3,
    title: "Check before you send",
    description: "Call canSend(email, 'marketing') in your email sending code",
    href: "/dashboard/widget-preview",
    cta: "View integration guide",
  },
];

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <DashboardHeader
        title="Dashboard"
        description="Overview of your email preference center"
      />

      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Subscribers"
            value={stats.totalSubscribers === 0 ? "—" : stats.totalSubscribers}
            subtitle="Unique email addresses"
            icon={Users}
            accent="indigo"
          />
          <StatCard
            label="Suppression Rate"
            value={stats.suppressionRate === 0 ? "—" : `${stats.suppressionRate}%`}
            subtitle="Emails suppressed this month"
            icon={ShieldOff}
            accent="amber"
          />
          <StatCard
            label="Active Categories"
            value={stats.activeCategories === 0 ? "—" : stats.activeCategories}
            subtitle="Email preference groups"
            icon={Tag}
            accent="emerald"
          />
          <StatCard
            label="canSend Checks/mo"
            value={stats.canSendChecks === 0 ? "—" : stats.canSendChecks}
            subtitle="API calls this month"
            icon={Zap}
            accent="indigo"
          />
        </div>

        {/* Empty state / Getting started */}
        {stats.isEmpty && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800">
              <h2 className="text-base font-semibold text-slate-100">
                🚀 Get started in 3 steps
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Your workspace is ready. Follow these steps to integrate PrefsKit.
              </p>
            </div>

            <div className="divide-y divide-slate-800">
              {gettingStartedSteps.map((item) => (
                <div key={item.step} className="flex items-start gap-4 px-6 py-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 text-sm font-bold ring-1 ring-indigo-500/20">
                    {item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{item.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                  </div>
                  <a
                    href={item.href}
                    className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
                  >
                    {item.cta}
                    <ArrowRight className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick code sample */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Integration snippet</h2>
              <p className="text-xs text-slate-500 mt-0.5">Drop this into your email-sending code</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Works with any SMTP
            </div>
          </div>
          <div className="p-6">
            <pre className="text-sm font-mono leading-relaxed overflow-x-auto">
              <code>
                <span className="text-slate-500">{"// Install: pnpm add @prefskit/sdk\n"}</span>
                <span className="text-purple-400">import</span>
                <span className="text-slate-300">{" { PrefsKit } "}</span>
                <span className="text-purple-400">from</span>
                <span className="text-green-400">{" '@prefskit/sdk'\n\n"}</span>
                <span className="text-purple-400">const</span>
                <span className="text-sky-300">{" prefskit "}</span>
                <span className="text-slate-400">{"= "}</span>
                <span className="text-yellow-300">{"new "}</span>
                <span className="text-green-400">{"PrefsKit"}</span>
                <span className="text-slate-300">{"({ apiKey: process.env.PREFSKIT_API_KEY })\n\n"}</span>
                <span className="text-slate-500">{"// Before sending any email:\n"}</span>
                <span className="text-purple-400">{"const "}</span>
                <span className="text-sky-300">{"ok "}</span>
                <span className="text-slate-400">{"= "}</span>
                <span className="text-purple-400">{"await "}</span>
                <span className="text-sky-300">{"prefskit"}</span>
                <span className="text-slate-400">{"."}</span>
                <span className="text-green-400">{"canSend"}</span>
                <span className="text-slate-300">{"(email, "}</span>
                <span className="text-orange-300">{"'marketing'"}</span>
                <span className="text-slate-300">{")\n"}</span>
                <span className="text-purple-400">{"if "}</span>
                <span className="text-slate-300">{"(ok) "}</span>
                <span className="text-purple-400">{"await "}</span>
                <span className="text-slate-300">{"resend.send(...)\n\n"}</span>
                <span className="text-slate-500">{"// Get unsubscribe URL for email footer:\n"}</span>
                <span className="text-purple-400">{"const "}</span>
                <span className="text-sky-300">{"url "}</span>
                <span className="text-slate-400">{"= "}</span>
                <span className="text-purple-400">{"await "}</span>
                <span className="text-sky-300">{"prefskit"}</span>
                <span className="text-slate-400">{"."}</span>
                <span className="text-green-400">{"unsubscribeUrl"}</span>
                <span className="text-slate-300">{"(email)"}</span>
              </code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
