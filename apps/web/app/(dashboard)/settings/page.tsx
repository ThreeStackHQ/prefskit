import type { Metadata } from "next";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <DashboardHeader title="Settings" description="Workspace configuration and preferences" />

      <main className="flex-1 p-4 lg:p-6 space-y-6 max-w-2xl">
        {/* Workspace section */}
        <section className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200">Workspace</h2>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Workspace name</label>
              <input
                defaultValue="My SaaS App"
                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Logo URL</label>
              <input
                placeholder="https://yourapp.com/logo.png"
                className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-slate-500">Shown on the hosted preferences page</p>
            </div>
            <div className="pt-2">
              <button className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                Save changes
              </button>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded-xl border border-red-500/20 bg-slate-900 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-500/20">
            <h2 className="text-sm font-semibold text-red-400">Danger zone</h2>
          </div>
          <div className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Delete workspace</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanently delete this workspace and all associated data.
              </p>
            </div>
            <button className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              Delete workspace
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
