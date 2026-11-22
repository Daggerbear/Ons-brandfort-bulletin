// src/components/menu/ItemRow.js
"use client";
import { parsePrice } from "./menuHelpers";
import { inputClass } from "./menuUi";
import ChoicesPanel from "./ChoicesPanel";

export default function ItemRow({
  item,
  expanded,
  t,
  categories,
  siblingItems,
  groups,
  values,
  onToggle,
  onPatch,
  onMove,
  onDuplicate,
  onDelete,
  choiceApi,
}) {
  const out = !item.is_available;

  const commitPrice = (e) => {
    const price = parsePrice(e.target.value);
    if (price === null) {
      e.target.value = item.price;
      return;
    }
    if (price !== Number(item.price)) onPatch(item.id, { price });
  };

  const commitName = (e) => {
    const name = e.target.value.trim();
    if (!name) {
      e.target.value = item.name;
      return;
    }
    if (name !== item.name) onPatch(item.id, { name });
  };

  const commitDesc = (e) => {
    const description = e.target.value.trim() || null;
    if (description !== (item.description || null)) onPatch(item.id, { description });
  };

  return (
    <div
      className={`rounded-xl border ${
        out ? "border-red-900/50 bg-red-950/10" : "border-neutral-800 bg-neutral-900"
      } ${expanded ? "ring-1 ring-orange-500/50" : ""}`}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left">
          <p className={`truncate font-semibold ${out ? "text-neutral-400" : "text-white"}`}>
            {item.name}
          </p>
          {item.description && (
            <p className="truncate text-xs text-neutral-500">{item.description}</p>
          )}
        </button>

        <div className="flex flex-shrink-0 items-center rounded-lg border border-neutral-700 bg-neutral-950 pl-2">
          <span className="text-sm text-neutral-500">R</span>
          <input
            key={`${item.id}-${item.price}`}
            defaultValue={Number(item.price)}
            inputMode="decimal"
            onBlur={commitPrice}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
            aria-label={t.fPrice}
            className="w-16 bg-transparent px-1 py-2 text-right text-base font-semibold text-white outline-none focus:text-orange-300"
          />
        </div>

        <button
          type="button"
          onClick={() => onPatch(item.id, { is_available: !item.is_available })}
          aria-pressed={item.is_available}
          className={`flex-shrink-0 rounded-lg px-2.5 py-2 text-xs font-semibold ${
            out
              ? "bg-red-900/60 text-red-200"
              : "bg-green-900/50 text-green-300"
          }`}
        >
          {out ? t.outStock : t.inStock}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-neutral-800 px-3 pb-4 pt-3">
          <div>
            <label className="mb-1 block text-xs text-neutral-400">{t.fName}</label>
            <input
              key={`n-${item.id}-${item.name}`}
              defaultValue={item.name}
              onBlur={commitName}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">{t.fDesc}</label>
            <textarea
              key={`d-${item.id}-${item.description || ""}`}
              defaultValue={item.description || ""}
              onBlur={commitDesc}
              rows={2}
              placeholder={t.fDescPh}
              className={`${inputClass} resize-y`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-neutral-400">{t.fCategory}</label>
            <select
              value={item.category_id || ""}
              onChange={(e) => onPatch(item.id, { category_id: e.target.value || null })}
              className={inputClass}
            >
              <option value="">{t.noCategoryOption}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onMove(item, -1)}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200"
            >
              {t.moveUp}
            </button>
            <button
              type="button"
              onClick={() => onMove(item, 1)}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200"
            >
              {t.moveDown}
            </button>
            <button
              type="button"
              onClick={() => onDuplicate(item)}
              className="rounded-lg border border-neutral-700 px-3 py-2 text-sm text-neutral-200"
            >
              {t.duplicate}
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              className="ml-auto rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-300"
            >
              {t.del}
            </button>
          </div>

          <ChoicesPanel
            item={item}
            groups={groups}
            values={values}
            siblingItems={siblingItems}
            t={t}
            api={choiceApi}
          />
        </div>
      )}
    </div>
  );
}
