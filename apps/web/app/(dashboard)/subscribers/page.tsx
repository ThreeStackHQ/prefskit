import type { Metadata } from "next";
import { Users, Search, Download } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata: Metadata = { title: "Subscribers" };

// TODO: Fetch from GET /api/subscribers once Bolt's API is ready
async function getSubscribers() {
  return { subscribers: [], total: 0 };
}

export default async function SubscribersPage() {
  const { subscribers, total } = await getSubscribers();

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <DashboardHeader
        title="Subscribers"
        description={`${total} subscribers across all categories`}
      />

      <main className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              placeholder="Search by email..."
              className="h-9 w-full rounded-lg border border-slate-700 bg-slate-800 pl-9 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Empty state */}
        {subscribers.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 mb-4">
              <Users className="h-7 w-7 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-300 mb-1">No subscribers yet</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              Subscribers will appear here once your first canSend() or unsubscribeUrl() API call is made.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
