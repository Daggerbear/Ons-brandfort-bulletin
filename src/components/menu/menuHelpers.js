// src/components/menu/menuHelpers.js
// Small pure helpers for the menu editor (no React in here).

export const ITEM_COLS = [
  "id",
  "business_id",
  "category_id",
  "name",
  "description",
  "price",
  "is_available",
  "sort_order",
];
export const CAT_COLS = ["id", "business_id", "name", "sort_order", "is_active"];

export function pick(row, cols) {
  const out = {};
  cols.forEach((c) => {
    out[c] = row[c];
  });
  return out;
}

export function money(n) {
  const v = Number(n) || 0;
  return Number.isInteger(v) ? `R${v}` : `R${v.toFixed(2)}`;
}

// "65", "65,50", "R65" -> 65 / 65.5 / 65. Anything else -> null
export function parsePrice(raw) {
  const cleaned = String(raw ?? "")
    .trim()
    .replace(/^R\s*/i, "")
    .replace(",", ".");
  if (cleaned === "") return null;
  const v = Number(cleaned);
  return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : null;
}

export function sortItems(list) {
  return [...list].sort(
    (a, b) =>
      (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
      String(a.name).localeCompare(String(b.name)),
  );
}

export function sortCats(list) {
  return sortItems(list);
}

// ---- Bulk price change -------------------------------------------------
// opts: { mode: "percent" | "rand", direction: "up" | "down", amount: number, roundTo: 0 | 0.5 | 1 | 5 }
export function newPrice(price, opts) {
  const p = Number(price) || 0;
  const sign = opts.direction === "down" ? -1 : 1;
  const amount = Number(opts.amount) || 0;
  let v = opts.mode === "percent" ? p * (1 + (sign * amount) / 100) : p + sign * amount;
  if (opts.roundTo > 0) v = Math.round(v / opts.roundTo) * opts.roundTo;
  return Math.max(0, Math.round(v * 100) / 100);
}

// ---- Dropdown choices ("Name | extra price" per line) -------------------
export function buildDrafts(groups, values) {
  return Object.fromEntries(
    groups.map((group) => [
      group.id,
      {
        name: group.name || "",
        is_required: group.is_required !== false,
        values: values
          .filter((v) => v.option_group_id === group.id)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((v) =>
            Number(v.price_adjustment) > 0 ? `${v.name} | ${v.price_adjustment}` : v.name,
          )
          .join("\n"),
      },
    ]),
  );
}

export function parseValues(raw) {
  return String(raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [namePart, pricePart] = line.split("|");
      const price = Number((pricePart || "").trim().replace(",", "."));
      return {
        name: namePart.trim(),
        price_adjustment: Number.isFinite(price) && price > 0 ? price : 0,
      };
    })
    .filter((v) => v.name);
}
