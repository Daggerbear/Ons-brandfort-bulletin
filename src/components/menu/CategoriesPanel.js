// src/components/menu/CategoriesPanel.js
"use client";
import { useState } from "react";
import { Card, PrimaryButton, inputClass } from "./menuUi";

export default function CategoriesPanel({
  t,
  categories,
  counts,
  onAdd,
  onPatch,
  onMove,
  onDelete,
}) {
  const [name, setName] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = await onAdd(name.trim());
    if (ok) setName("");
  };

  return (
    <Card title={t.catTitle}>
      <form onSubmit={submit} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.catAddPh}
          className={inputClass}
        />
        <PrimaryButton type="submit" className="flex-shrink-0">
          {t.catAdd}
        </PrimaryButton>
      </form>

      <div className="mt-4 space-y-2">
        {categories.length === 0 && <p className="text-sm text-neutral-500">{t.catNone}</p>}
        {categories.map((c) => (
          <div key={c.id} className="rounded-lg border border-neutral-700 bg-neutral-800 p-3">
            <div className="flex items-center gap-2">
              <input
                key={`${c.id}-${c.name}`}
                defaultValue={c.name}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (!v) e.target.value = c.name;
                  else if (v !== c.name) onPatch(c.id, { name: v });
                }}
                className="min-w-0 flex-1 border-b border-neutral-600 bg-transparent pb-1 text-base font-semibold text-white outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => onMove(c, -1)}
                aria-label={t.moveUp}
                className="rounded border border-neutral-600 px-2.5 py-1.5 text-sm text-neutral-200"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(c, 1)}
                aria-label={t.moveDown}
                className="rounded border border-neutral-600 px-2.5 py-1.5 text-sm text-neutral-200"
              >
                ↓
              </button>
            </div>
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="text-neutral-500">{t.catItems(counts[c.id] || 0)}</span>
              <label className="flex items-center gap-2 text-neutral-200">
                <input
                  type="checkbox"
                  checked={c.is_active}
                  onChange={(e) => onPatch(c.id, { is_active: e.target.checked })}
                  className="h-4 w-4 accent-orange-500"
                />
                {t.catVisible}
              </label>
              <button
                type="button"
                onClick={() => onDelete(c)}
                className="ml-auto text-red-300"
              >
                {t.del}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
