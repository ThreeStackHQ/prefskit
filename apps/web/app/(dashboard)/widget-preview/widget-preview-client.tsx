"use client";

import { useState, useCallback } from "react";
import { Copy, CheckCircle2, ExternalLink, Code2, Mail, Monitor } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";

const SAMPLE_EMAIL = "subscriber@example.com";
const SAMPLE_TOKEN = "eyJhbGciOiJIUzI1NiJ9.sample";
const BASE_URL = "https://prefskit.io";

const tabs = [
  { id: "preview", label: "Live Preview", icon: Monitor },
  { id: "urls", label: "URLs & Headers", icon: Code2 },
  { id: "sdk", label: "SDK Examples", icon: Mail },
] as const;
type TabId = (typeof tabs)[number]["id"];

const sampleCategories = [
  { slug: "marketing", label: "Marketing & Announcements", description: "Product launches and promotions", required: false, enabled: true },
  { slug: "product-updates", label: "Product Updates", description: "New features and changelogs", required: false, enabled: true },
  { slug: "transactional", label: "Transactional", description: "Account alerts and receipts", required: true, enabled: true },
];

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
    >
      {copied ? (
        <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
      ) : (
        <><Copy className="h-3.5 w-3.5" /> {label ?? "Copy"}</>
      )}
    </button>
  );
}

function PrefsPagePreview() {
  const [prefs, setPrefs] = useState(
    Object.fromEntries(sampleCategories.map((c) => [c.slug, c.enabled])),
  );
  const [saved, setSaved] = useState(false);
  const [unsubscribeOpen, setUnsubscribeOpen] = useState(false);

  const handleSave = async () => {
    await new Promise((r) => setTimeout(r, 400));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-900 px-4 py-3">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-slate-700" />
          <div className="h-3 w-3 rounded-full bg-slate-700" />
          <div className="h-3 w-3 rounded-full bg-slate-700" />
        </div>
        <div className="flex-1 rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-500 font-mono text-center">
          {BASE_URL}/u/{SAMPLE_TOKEN.slice(0, 20)}...
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-slate-600" />
      </div>

      {/* Page content */}
      <div className="flex min-h-72 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Email Preferences</h1>
            <p className="text-sm text-slate-400">{SAMPLE_EMAIL}</p>
          </div>

          {/* Categories */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 divide-y divide-slate-800">
            {sampleCategories.map((cat) => (
              <div key={cat.slug} className="flex items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-200">{cat.label}</p>
                    {cat.required && (
                      <Badge variant="indigo" className="text-[10px]">Transactional</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{cat.description}</p>
                </div>
                <button
                  disabled={cat.required}
                  onClick={() => !cat.required && setPrefs((p) => ({ ...p, [cat.slug]: !p[cat.slug] }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    cat.required || prefs[cat.slug] ? "bg-indigo-600" : "bg-slate-700"
                  } ${cat.required ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
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
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            {saved ? "✓ Saved!" : "Save preferences"}
          </button>

          {/* Unsubscribe */}
          <div className="text-center">
            <button
              onClick={() => setUnsubscribeOpen(true)}
              className="text-xs text-slate-500 underline hover:text-slate-400 transition-colors"
            >
              Unsubscribe from all emails
            </button>
          </div>
        </div>
      </div>

      {/* Unsubscribe modal overlay */}
      {unsubscribeOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
          <div className="mx-4 w-full max-w-xs rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-slate-100 mb-1">Unsubscribe from all</h3>
            <p className="text-sm text-slate-400 mb-4">
              You&apos;ll no longer receive any emails from this sender, including transactional emails.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUnsubscribeOpen(false)}
                className="flex-1 rounded-lg border border-slate-700 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setUnsubscribeOpen(false)}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-500 transition-colors"
              >
                Unsubscribe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UrlsPanel() {
  const unsubscribeUrl = `${BASE_URL}/u/${SAMPLE_TOKEN}`;
  const listUnsubscribeHeader = `List-Unsubscribe: <${unsubscribeUrl}>, <mailto:unsubscribe@prefskit.io?subject=unsubscribe>`;
  const listUnsubscribePost = `List-Unsubscribe-Post: List-Unsubscribe=One-Click`;

  const CodeBlock = ({ code, label }: { code: string; label: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</label>
        <CopyButton text={code} />
      </div>
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
        <code className="text-sm font-mono text-slate-300 break-all">{code}</code>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <CodeBlock code={unsubscribeUrl} label="Unsubscribe URL" />
      <CodeBlock code={listUnsubscribeHeader} label="List-Unsubscribe header (RFC 2369)" />
      <CodeBlock code={listUnsubscribePost} label="List-Unsubscribe-Post header (RFC 8058)" />

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Usage example (Resend)</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
{`await resend.emails.send({
  to: email,
  subject: "Your weekly digest",
  headers: {
    "List-Unsubscribe": "<${BASE_URL}/u/{token}>",
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  },
})`}
        </pre>
      </div>
    </div>
  );
}

function SdkPanel() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Check before sending</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`import { PrefsKit } from '@prefskit/sdk'

const pk = new PrefsKit({ apiKey: process.env.PREFSKIT_API_KEY })

// Check if subscriber wants marketing emails
const canSend = await pk.canSend(email, 'marketing')
if (canSend) {
  await resend.emails.send(...)
}`}
        </pre>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Get unsubscribe URL for email footer</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`// Generate a signed URL valid for 30 days
const url = await pk.unsubscribeUrl(email)

// Use in email template:
// <a href="{url}">Manage preferences</a>`}
        </pre>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-200">Suppress an address manually</h3>
        <pre className="text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`// Add to suppression list (e.g., after hard bounce)
await pk.suppress(email)

// Remove from suppression list
await pk.unsuppress(email)`}
        </pre>
      </div>
    </div>
  );
}

export function WidgetPreview() {
  const [activeTab, setActiveTab] = useState<TabId>("preview");

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <DashboardHeader
        title="Widget Preview"
        description="Preview the hosted preferences page and copy integration snippets"
      />

      <main className="flex-1 p-4 lg:p-6 space-y-5 max-w-3xl">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-slate-800 bg-slate-900 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-slate-700 text-slate-100 shadow-sm"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="relative">
          {activeTab === "preview" && <PrefsPagePreview />}
          {activeTab === "urls" && <UrlsPanel />}
          {activeTab === "sdk" && <SdkPanel />}
        </div>
      </main>
    </div>
  );
}
