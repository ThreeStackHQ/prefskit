"use client";

import { useState, useCallback } from "react";
import { Mail, Lock, CheckCircle2, AlertCircle, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkspaceBranding {
  name: string;
  logoUrl: string | null;
  primaryColor: string;
}

interface Category {
  id: string;
  slug: string;
  label: string;
  description: string;
  required: boolean;
}

interface PrefsPageClientProps {
  token: string;
  email: string;
  branding: WorkspaceBranding;
  categories: Category[];
  initialPreferences: Record<string, boolean>;
}

type SaveState = "idle" | "saving" | "success" | "error";

export function PrefsPageClient({
  token,
  email,
  branding,
  categories,
  initialPreferences,
}: PrefsPageClientProps) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(initialPreferences);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [unsubscribeOpen, setUnsubscribeOpen] = useState(false);
  const [unsubscribeDone, setUnsubscribeDone] = useState(false);

  const handleToggle = useCallback((slug: string, required: boolean) => {
    if (required) return;
    setPrefs((prev) => ({ ...prev, [slug]: !prev[slug] }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    try {
      // TODO: POST /api/public/preferences once Bolt's API is ready
      // await fetch('/api/public/preferences', {
      //   method: 'POST',
      //   body: JSON.stringify({ token, preferences: prefs }),
      // })
      await new Promise((r) => setTimeout(r, 700));
      setSaveState("success");
      setTimeout(() => setSaveState("idle"), 4000);
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 4000);
    }
  }, [prefs]);

  const handleUnsubscribeAll = useCallback(async () => {
    // TODO: POST /api/public/unsubscribe-all once Bolt's API is ready
    await new Promise((r) => setTimeout(r, 500));
    setUnsubscribeOpen(false);
    setUnsubscribeDone(true);
  }, []);

  if (unsubscribeDone) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 mb-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Unsubscribed</h1>
          <p className="text-slate-400">
            You&apos;ve been unsubscribed from all emails from{" "}
            <strong className="text-slate-200">{branding.name}</strong>. You can close this page.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="mx-auto w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.logoUrl}
              alt={branding.name}
              className="mx-auto h-12 w-auto object-contain"
            />
          ) : (
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20">
              <Mail className="h-6 w-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-slate-100">{branding.name}</h1>
            <p className="text-sm font-semibold text-slate-300 mt-1">Email Preferences</p>
            <p className="text-xs text-slate-500 mt-0.5">{email}</p>
          </div>
        </div>

        {/* Save success / error banners */}
        {saveState === "success" && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-200">Your preferences have been saved.</p>
          </div>
        )}
        {saveState === "error" && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-200">Failed to save preferences. Please try again.</p>
          </div>
        )}

        {/* Category list */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 divide-y divide-slate-800 overflow-hidden">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 px-5 py-4"
              role={cat.required ? "group" : "button"}
              onClick={() => !cat.required && handleToggle(cat.slug, cat.required)}
              style={{ cursor: cat.required ? "default" : "pointer" }}
            >
              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-slate-200">{cat.label}</span>
                  {cat.required && (
                    <Badge variant="indigo">
                      <Lock className="h-2.5 w-2.5" />
                      Transactional
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
              </div>

              {/* Toggle */}
              <button
                disabled={cat.required}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(cat.slug, cat.required);
                }}
                aria-label={`${prefs[cat.slug] ? "Disable" : "Enable"} ${cat.label}`}
                aria-checked={prefs[cat.slug] ?? false}
                role="switch"
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                  cat.required ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                } ${prefs[cat.slug] ? "bg-indigo-600" : "bg-slate-700"}`}
              >
                <span
                  className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200 ${
                    prefs[cat.slug] ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saveState === "saving"}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 active:bg-indigo-700 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saveState === "saving" ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving…
            </span>
          ) : (
            "Save preferences"
          )}
        </button>

        {/* Unsubscribe all */}
        <div className="text-center">
          <button
            onClick={() => setUnsubscribeOpen(true)}
            className="text-xs text-slate-500 underline underline-offset-2 hover:text-slate-400 transition-colors"
          >
            Unsubscribe from all emails
          </button>
        </div>
      </div>

      {/* Unsubscribe All Confirmation Modal */}
      {unsubscribeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Unsubscribe from all?</h2>
                <p className="mt-1 text-sm text-slate-400">
                  You&apos;ll stop receiving <strong className="text-slate-300">all</strong> emails
                  from {branding.name}, including transactional emails like receipts and security
                  alerts.
                </p>
              </div>
              <button
                onClick={() => setUnsubscribeOpen(false)}
                className="ml-3 p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setUnsubscribeOpen(false)}
                className="flex-1 rounded-lg border border-slate-700 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Keep subscribed
              </button>
              <button
                onClick={handleUnsubscribeAll}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-500 transition-colors"
              >
                Unsubscribe all
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
