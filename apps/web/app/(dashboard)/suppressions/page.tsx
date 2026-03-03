import type { Metadata } from "next";
import { ShieldOff } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata: Metadata = { title: "Suppressions" };

// TODO: Fetch from GET /api/suppressions once Bolt's API is ready
async function getSuppressions() {
  return { suppressions: [], total: 0 };
}

export default async function SuppressionsPage() {
  const { suppressions, total } = await getSuppressions();

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <DashboardHeader
        title="Suppressions"
        description={`${total} suppressed addresses (global unsubscribes + bounces)`}
      />

      <main className="flex-1 p-4 lg:p-6">
        {suppressions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 mb-4">
              <ShieldOff className="h-7 w-7 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-300 mb-1">No suppressions</h3>
            <p className="text-sm text-slate-500 max-w-xs">
              When subscribers click &quot;Unsubscribe from all emails&quot;, they appear here.
              canSend() will always return false for suppressed addresses.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
