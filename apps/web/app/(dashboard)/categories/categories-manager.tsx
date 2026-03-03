"use client";

import { useState, useCallback } from "react";
import { Plus, GripVertical, Trash2, Tag, Lock } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { generateSlug } from "@/lib/utils";

interface Category {
  id: string;
  slug: string;
  label: string;
  description: string;
  required: boolean;
  order: number;
}

interface AddCategoryFormState {
  slug: string;
  label: string;
  description: string;
  required: boolean;
}

const emptyForm: AddCategoryFormState = {
  slug: "",
  label: "",
  description: "",
  required: false,
};

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<AddCategoryFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const handleLabelChange = useCallback((label: string) => {
    setForm((prev) => ({
      ...prev,
      label,
      slug: generateSlug(label),
    }));
  }, []);

  const handleAdd = useCallback(async () => {
    if (!form.label.trim() || !form.slug.trim()) return;
    setSaving(true);
    // TODO: POST /api/categories
    await new Promise((r) => setTimeout(r, 500));
    const newCat: Category = {
      id: Math.random().toString(36).slice(2),
      ...form,
      order: categories.length,
    };
    setCategories((prev) => [...prev, newCat]);
    setForm(emptyForm);
    setAddOpen(false);
    setSaving(false);
  }, [form, categories.length]);

  const handleDelete = useCallback(async (category: Category) => {
    // TODO: DELETE /api/categories/:id
    setCategories((prev) => prev.filter((c) => c.id !== category.id));
    setDeleteTarget(null);
  }, []);

  // Simple drag-and-drop reorder
  const handleDragStart = (id: string) => setDragging(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOver(id);
  };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragging || dragging === targetId) return;
    setCategories((prev) => {
      const items = [...prev];
      const fromIdx = items.findIndex((c) => c.id === dragging);
      const toIdx = items.findIndex((c) => c.id === targetId);
      const [moved] = items.splice(fromIdx, 1);
      items.splice(toIdx, 0, moved);
      return items.map((c, i) => ({ ...c, order: i }));
    });
    setDragging(null);
    setDragOver(null);
    // TODO: PATCH /api/categories/reorder
  };

  return (
    <div className="flex flex-1 flex-col overflow-auto">
      <DashboardHeader
        title="Categories"
        description="Email preference groups shown to subscribers"
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add category
          </Button>
        }
      />

      <main className="flex-1 p-4 lg:p-6 space-y-4">
        <p className="text-xs text-slate-500">
          Drag to reorder. Required categories cannot be toggled off by subscribers.
        </p>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 mb-4">
              <Tag className="h-7 w-7 text-slate-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-300 mb-1">No categories yet</h3>
            <p className="text-sm text-slate-500 max-w-xs mb-4">
              Create your first email category to start collecting subscriber preferences.
            </p>
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add your first category
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="divide-y divide-slate-800">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={() => handleDragStart(cat.id)}
                  onDragOver={(e) => handleDragOver(e, cat.id)}
                  onDrop={(e) => handleDrop(e, cat.id)}
                  onDragEnd={() => { setDragging(null); setDragOver(null); }}
                  className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                    dragOver === cat.id ? "bg-slate-800" : "hover:bg-slate-800/50"
                  } ${dragging === cat.id ? "opacity-50" : ""}`}
                >
                  {/* Drag handle */}
                  <button className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0">
                    <GripVertical className="h-5 w-5" />
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-slate-200">{cat.label}</span>
                      <Badge variant={cat.required ? "indigo" : "outline"}>
                        {cat.required ? (
                          <><Lock className="h-2.5 w-2.5" /> Required</>
                        ) : (
                          "Optional"
                        )}
                      </Badge>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{cat.description}</p>
                    )}
                    <p className="text-xs text-slate-600 mt-0.5 font-mono">slug: {cat.slug}</p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(cat)}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add Category Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent title="Add category" description="Define a new email preference group">
          <div className="space-y-4">
            <Input
              label="Label"
              placeholder="e.g. Marketing & News"
              value={form.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              id="cat-label"
            />
            <Input
              label="Slug"
              placeholder="marketing-news"
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              hint="Used in the SDK: canSend(email, 'marketing-news')"
              id="cat-slug"
            />
            <Textarea
              label="Description"
              placeholder="What emails does this include?"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              id="cat-desc"
            />
            <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-200">Required</p>
                <p className="text-xs text-slate-500">Subscribers cannot opt out of this category</p>
              </div>
              <Switch
                checked={form.required}
                onCheckedChange={(checked) => setForm((p) => ({ ...p, required: checked }))}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAdd} loading={saving} disabled={!form.label.trim()}>
                Add category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent
          title="Delete category"
          description={`Are you sure you want to delete "${deleteTarget?.label}"? This cannot be undone.`}
        >
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
