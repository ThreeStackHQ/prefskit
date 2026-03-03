"use client";

import { useState, useTransition } from "react";
import { updatePreferences, unsubscribeAll } from "./actions";

interface Category {
  id: string;
  slug: string;
  label: string;
  description: string | null;
  required: boolean;
  subscribed: boolean;
}

interface PrefsFormProps {
  token: string;
  categories: Category[];
  email: string;
  workspaceId: string;
}

export default function PrefsForm({
  token,
  categories,
  email,
  workspaceId,
}: PrefsFormProps) {
  const [prefs, setPrefs] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c.slug, c.subscribed])),
  );
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle(slug: string, required: boolean) {
    if (required) return; // Cannot toggle required categories
    setPrefs((prev) => ({ ...prev, [slug]: !prev[slug] }));
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      await updatePreferences({ token, prefs });
      setSaved(true);
    });
  }

  function handleUnsubscribeAll() {
    startTransition(async () => {
      await unsubscribeAll({ email, workspaceId });
    });
  }

  if (categories.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
        <p className="text-gray-400 text-sm">No email categories configured.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preferences Card */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 divide-y divide-gray-800">
        {categories.map((category) => {
          const isOn = prefs[category.slug] ?? true;
          return (
            <div
              key={category.id}
              className="px-6 py-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">
                    {category.label}
                  </p>
                  {category.required && (
                    <span className="text-xs bg-indigo-900/50 text-indigo-400 px-1.5 py-0.5 rounded-full border border-indigo-800">
                      Required
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={() => handleToggle(category.slug, category.required)}
                disabled={category.required || isPending}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  isOn ? "bg-indigo-600" : "bg-gray-700"
                } ${category.required ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                aria-pressed={isOn}
                aria-label={`Toggle ${category.label}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    isOn ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
      >
        {isPending ? "Saving..." : saved ? "✓ Saved!" : "Save preferences"}
      </button>

      {/* Unsubscribe all */}
      <div className="text-center">
        <button
          type="button"
          onClick={handleUnsubscribeAll}
          disabled={isPending}
          className="text-sm text-gray-500 underline hover:text-gray-400 transition-colors"
        >
          Unsubscribe from all emails
        </button>
      </div>
    </div>
  );
}
