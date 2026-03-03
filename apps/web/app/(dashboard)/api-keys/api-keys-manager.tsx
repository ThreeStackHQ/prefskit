"use client";

import { useState, useCallback } from "react";
import { Plus, Key, Copy, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
}

interface NewKeyResult {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey: string;
  createdAt: string;
  lastUsedAt: null;
}

interface ApiKeysManagerProps {
  initialKeys: ApiKey[];
}

export function ApiKeysManager({ initialKeys }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [addOpen, setAddOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyResult, setNewKeyResult] = useState<NewKeyResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!newKeyName.trim()) return;
    setGenerating(true);
    // TODO: POST /api/api-keys
    await new Promise((r) => setTimeout(r, 600));
    const result: NewKeyResult = {
      id: Math.random().toString(36).slice(2),
      name: newKeyName,
      keyPrefix: "pk_live",
      fullKey: `pk_live_${Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join("")}`,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };
    setNewKeyResult(result);
    setKeys((prev) => [
      ...prev,
      { id: result.id, name: result.name, keyPrefix: result.keyPrefix, createdAt: result.createdAt, lastUsedAt: null },
    ]);
    setGenerating(false);
  }, [newKeyName]);

  const handleCopy = useCallback(async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleRevoke = useCallback(async (key: ApiKey) => {
    // TODO: DELETE /api/api-keys/:id
    setKeys((prev) => prev.filter((k) => k.id !== key.id));
    setDeleteTarget(null);
  }, []);

  const handleCloseNewKey = () => {
    setNewKeyResult(null);
    setNewKeyName("");
    setAddOpen(false);
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <DashboardHeader
        title="API Keys"
        description="Authenticate your SDK and API requests"
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Generate key
          </Button>
        }
      />

      <main className="flex-1 p-4 lg:p-6 space-y-4 max-w-3xl">
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-200/80">
            API keys have full access to your workspace. Store them securely in environment variables,
            never in client-side code.
          </p>
        </div>

        {keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 mb-4">
              <Key className="h-7 w-7 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-300 mb-1">No API keys</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-4">
              Generate your first API key to authenticate SDK requests.
            </p>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Generate your first key
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Name</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:block">Last used</p>
            </div>
            <div className="divide-y divide-slate-800">
              {keys.map((key) => (
                <div key={key.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/40 transition-colors">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800">
                    <Key className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{key.name}</p>
                    <p className="text-xs text-slate-500 font-mono">{key.keyPrefix}_••••••••••••</p>
                  </div>
                  <div className="hidden sm:block text-xs text-slate-500">
                    {key.lastUsedAt
                      ? new Date(key.lastUsedAt).toLocaleDateString()
                      : "Never used"}
                  </div>
                  <Badge variant="success">Active</Badge>
                  <button
                    onClick={() => setDeleteTarget(key)}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Revoke key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Generate Key Modal */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) handleCloseNewKey(); }}>
        <DialogContent title={newKeyResult ? "Save your API key" : "Generate API key"}>
          {!newKeyResult ? (
            <div className="space-y-4">
              <Input
                label="Key name"
                placeholder="e.g. Production, Development"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                id="key-name"
              />
              <div className="flex items-center justify-end gap-3 pt-2">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={handleGenerate} loading={generating} disabled={!newKeyName.trim()}>
                  Generate key
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200">
                  This is the only time your full API key will be shown. Copy it now and store it securely.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Your API key</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm font-mono text-emerald-400 break-all">
                    {newKeyResult.fullKey}
                  </code>
                  <button
                    onClick={() => handleCopy(newKeyResult.fullKey)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end pt-2">
                <Button onClick={handleCloseNewKey}>Done</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Revoke Confirm Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent
          title="Revoke API key"
          description={`Revoking "${deleteTarget?.name}" will immediately invalidate it. Any SDK or API calls using this key will fail.`}
        >
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleRevoke(deleteTarget)}
            >
              Revoke key
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
