"use client";

import { useState } from "react";

interface UpgradeButtonProps {
  plan: "indie" | "pro";
  label: string;
  highlight?: boolean;
}

export default function UpgradeButton({
  plan,
  label,
  highlight,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = (await res.json()) as { url?: string; error?: string };

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? "Failed to start checkout");
      }
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleUpgrade}
      disabled={loading}
      className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        highlight
          ? "bg-indigo-600 text-white hover:bg-indigo-500"
          : "border border-slate-700 text-slate-300 hover:bg-slate-800"
      }`}
    >
      {loading ? "Redirecting to Stripe…" : label}
    </button>
  );
}
