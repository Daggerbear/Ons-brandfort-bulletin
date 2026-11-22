// src/components/menu/BulkTools.js
"use client";
import { useMemo, useState } from "react";
import { money, newPrice, sortItems } from "./menuHelpers";
import { Card, Field, SelectField, PrimaryButton } from "./menuUi";

// ---- Change many prices ---------------------------------------------------
function PriceTool({ t, items, categories, onApply }) {
  const [scope, setScope] = useState("all");
  const [mode, setMode] = useState("percent");
  const [direction, setDirection] = useState("up");
  const [amount, setAmount] = useState("");
  const [roundTo, setRoundTo] = useState("1");

  const changes = useMemo(() => {
    const amt = Number(String(amount).replace(",", "."));
    if (!amt || amt <= 0) return [];
    const pool = items.filter((i) =>
      scope === "all" ? true : scope === "none" ? !i.category_id : i.category_id === scope,
    );
    return sortItems(pool)
      .map((i) => ({
        item: i,
        price: newPrice(i.price, { mode, direction, amount: amt, roundTo: Number(roundTo) }),
      }))
      .filter((c) => c.price !== Number(c.item.price));
  }, [items, scope, mode, direction, amount, roundTo]);

  return (
    <Card title={t.toolPricesTitle} help={t.toolPricesHelp}>
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField label={t.scope} value={scope} onChange={setScope}>
          <option value="all">{t.scopeAll}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
          <option value="none">{t.chipNone}</option>
        </SelectField>
        <SelectField label={t.mode} value={mode} onChange={setMode}>
          <option value="percent">{t.modePercent}</option>
          <option value="rand">{t.modeRand}</option>
        </SelectField>
        <SelectField label=" " value={direction} onChange={setDirection}>
          <option value="up">{t.up}</option>
          <option value="down">{t.down}</option>
        </SelectField>
        <Field
          label={t.amount}
          value={amount}
          onChange={setAmount}
          inputMode="decimal"
          placeholder={mode === "percent" ? "10" : "5"}
        />
        <SelectField label={t.rounding} value={roundTo} onChange={setRoundTo}>
          <option value="0">{t.roundNone}</option>
          <option value="0.5">{t.round50}</option>
          <option value="1">{t.round1}</option>
          <option value="5">{t.round5}</option>
        </SelectField>
      </div>

      {amount !== "" && (
        <div className="mt-4 rounded-lg border border-neutral-700 bg-neutral-950 p-3 text-sm">
          <p className="text-xs uppercase tracking-wide text-neutral-500">{t.previewTitle}</p>
          {changes.length === 0 ? (
            <p className="mt-2 text-neutral-400">{t.noChange}</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {changes.slice(0, 6).map((c) => (
                <li key={c.item.id} className="flex justify-between gap-3 text-neutral-200">
                  <span className="truncate">{c.item.name}</span>
                  <span className="flex-shrink-0 text-neutral-400">
                    {money(c.item.price)} → <span className="text-orange-300">{money(c.price)}</span>
                  </span>
                </li>
              ))}
              {changes.length > 6 && (
                <li className="text-neutral-500">{t.moreItems(changes.length - 6)}</li>
              )}
            </ul>
          )}
        </div>
      )}

      <PrimaryButton
        type="button"
        disabled={changes.length === 0}
        className="mt-4 w-full"
        onClick={() => {
          if (!window.confirm(t.confirmPrices(changes.length))) return;
          onApply(changes.map((c) => ({ ...c.item, price: c.price })));
          setAmount("");
        }}
      >
        {t.applyPrices(changes.length)}
      </PrimaryButton>
    </Card>
  );
}

// ---- Everything in a category in / out of stock ----------------------------
function StockTool({ t, items, categories, onApply }) {
  const [scope, setScope] = useState(categories[0]?.id || "none");
  const pool = items.filter((i) => (scope === "none" ? !i.category_id : i.category_id === scope));

  return (
    <Card title={t.toolStockTitle}>
      <SelectField value={scope} onChange={setScope}>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value="none">{t.chipNone}</option>
      </SelectField>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={pool.length === 0}
          onClick={() => onApply(pool.map((i) => ({ ...i, is_available: true })))}
          className="rounded-lg bg-green-900/50 px-3 py-3 text-sm font-semibold text-green-300 disabled:opacity-40"
        >
          {t.stockAllIn}
        </button>
        <button
          type="button"
          disabled={pool.length === 0}
          onClick={() => onApply(pool.map((i) => ({ ...i, is_available: false })))}
          className="rounded-lg bg-red-900/60 px-3 py-3 text-sm font-semibold text-red-200 disabled:opacity-40"
        >
          {t.stockAllOut}
        </button>
      </div>
    </Card>
  );
}

export default function BulkTools({ t, items, categories, onApplyRows }) {
  return (
    <div className="space-y-4">
      <PriceTool t={t} items={items} categories={categories} onApply={(rows) => onApplyRows(rows, "price")} />
      <StockTool t={t} items={items} categories={categories} onApply={(rows) => onApplyRows(rows, "stock")} />
    </div>
  );
}
