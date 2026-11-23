// src/components/menu/ChoicesPanel.js
"use client";
import { useEffect, useMemo, useState } from "react";
import { buildDrafts } from "./menuHelpers";
import { Field, TextArea } from "./menuUi";

export default function ChoicesPanel({ item, groups, values, siblingItems, t, api }) {
  const [drafts, setDrafts] = useState(() => buildDrafts(groups, values));
  const [copyFor, setCopyFor] = useState(null); // group id with the "copy to others" list open
  const [picked, setPicked] = useState(() => new Set());

  // Reset the typed text only when the saved data really changed
  const signature = useMemo(
    () =>
      JSON.stringify([
        groups.map((g) => [g.id, g.name, g.is_required]),
        values
          .filter((v) => groups.some((g) => g.id === v.option_group_id))
          .map((v) => [v.id, v.name, v.price_adjustment]),
      ]),
    [groups, values],
  );
  useEffect(() => {
    setDrafts(buildDrafts(groups, values));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const setDraft = (groupId, field, value) =>
    setDrafts((cur) => ({ ...cur, [groupId]: { ...cur[groupId], [field]: value } }));

  const others = siblingItems.filter((s) => s.id !== item.id);

  const openCopy = (groupId) => {
    setCopyFor(copyFor === groupId ? null : groupId);
    setPicked(new Set());
  };
  const togglePick = (id) =>
    setPicked((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <details className="rounded-lg border border-neutral-700 bg-neutral-950/60 p-3" open>
      <summary className="cursor-pointer text-sm font-semibold text-orange-300">
        {t.choicesTitle}
        {groups.length > 0 && <span className="ml-2 text-neutral-500">({groups.length})</span>}
      </summary>
      <p className="mt-2 text-xs text-neutral-500">{t.choicesHelp}</p>
      <p className="mt-1 text-xs text-neutral-500">{t.choicesExample}</p>

      <div className="mt-3 space-y-4">
        {groups.map((group) => {
          const draft = drafts[group.id] || { name: "", is_required: true, values: "" };
          return (
            <div key={group.id} className="rounded-lg border border-neutral-700 bg-neutral-900 p-3">
              <Field
                label={t.groupLabel}
                value={draft.name}
                onChange={(v) => setDraft(group.id, "name", v)}
                placeholder={t.groupLabelPh}
              />
              <label className="mt-3 flex items-center gap-2 text-sm text-neutral-200">
                <input
                  type="checkbox"
                  checked={draft.is_required}
                  onChange={(e) => setDraft(group.id, "is_required", e.target.checked)}
                  className="h-5 w-5 accent-orange-500"
                />
                {t.mustChoose}
              </label>
              <div className="mt-3">
                <TextArea
                  label={t.choicesLabel}
                  value={draft.values}
                  onChange={(v) => setDraft(group.id, "values", v)}
                  placeholder={t.choicesPh}
                  rows={5}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => api.saveGroup(group.id, draft)}
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-600"
                >
                  {t.saveChoices}
                </button>
                {others.length > 0 && (
                  <button
                    type="button"
                    onClick={() => openCopy(group.id)}
                    className="rounded-lg border border-neutral-600 px-3 py-2 text-sm text-neutral-200"
                  >
                    {t.copyToOthers}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => api.deleteGroup(group.id)}
                  className="ml-auto rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-300"
                >
                  {t.delGroup}
                </button>
              </div>

              {copyFor === group.id && (
                <div className="mt-3 rounded-lg border border-neutral-700 bg-neutral-950 p-3">
                  <p className="text-xs text-neutral-400">{t.copyPickTitle}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPicked(new Set(others.map((o) => o.id)))}
                      className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-200"
                    >
                      {t.pickAll}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPicked(new Set())}
                      className="rounded border border-neutral-700 px-2 py-1 text-xs text-neutral-200"
                    >
                      {t.pickNone}
                    </button>
                  </div>
                  <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                    {others.map((o) => (
                      <label key={o.id} className="flex items-center gap-2 py-1 text-sm text-neutral-200">
                        <input
                          type="checkbox"
                          checked={picked.has(o.id)}
                          onChange={() => togglePick(o.id)}
                          className="h-4 w-4 accent-orange-500"
                        />
                        <span className="truncate">{o.name}</span>
                      </label>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={picked.size === 0}
                    onClick={async () => {
                      await api.copyGroupTo(group, [...picked]);
                      setCopyFor(null);
                      setPicked(new Set());
                    }}
                    className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
                  >
                    {t.copyDo(picked.size)}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {others.length === 0 && groups.length > 0 && (
        <p className="mt-2 text-xs text-neutral-600">{t.noOthers}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-neutral-500">{t.quickLabel}</span>
        {(t.quickGroups || []).map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => api.addGroup(item.id, name)}
            className="rounded-full border border-orange-500/50 px-3 py-1 text-xs font-semibold text-orange-300 hover:bg-orange-500/10"
          >
            + {name}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => api.addGroup(item.id)}
        className="mt-3 rounded-lg border border-orange-500/60 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-orange-500/10"
      >
        {t.addGroup}
      </button>
    </details>
  );
}
