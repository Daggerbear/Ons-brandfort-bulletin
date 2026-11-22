// src/components/mybiz/profileHelpers.js
// Pure helpers for the free business profile page.

export const MAX_DESC = 500;

export function valuesFromBiz(biz) {
  return {
    name: biz.name || "",
    category: biz.category || "",
    description: biz.description || "",
    contact: biz.contact || "",
    address: biz.address || "",
    hours: biz.hours || "",
    website: biz.website || "",
    services: Array.isArray(biz.services) ? biz.services.filter(Boolean) : [],
  };
}

export function toPayload(v) {
  return {
    name: v.name.trim(),
    category: v.category.trim() || null,
    description: v.description.trim() || null,
    contact: v.contact.trim() || null,
    address: v.address.trim() || null,
    hours: v.hours.trim() || null,
    website: v.website.trim() || null,
    services: v.services.map((s) => s.trim()).filter(Boolean),
  };
}

export function sameValues(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// How complete the free profile is: 6 things that matter to customers.
export function completeness(v) {
  const checks = [
    ["description", v.description.trim().length >= 40],
    ["contact", v.contact.trim() !== ""],
    ["address", v.address.trim() !== ""],
    ["hours", v.hours.trim() !== ""],
    ["services", v.services.length > 0],
    ["category", v.category.trim() !== ""],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([, ok]) => !ok).map(([key]) => key),
  };
}

export function hoursPresets(lang) {
  return lang === "en"
    ? ["Mon–Fri 08:00–17:00", "Mon–Fri 08:00–17:00, Sat 08:00–13:00", "Mon–Sat 08:00–17:00", "Every day 08:00–20:00", "Open 24 hours"]
    : ["Ma–Vr 08:00–17:00", "Ma–Vr 08:00–17:00, Sa 08:00–13:00", "Ma–Sa 08:00–17:00", "Elke dag 08:00–20:00", "24 uur oop"];
}

export function addService(list, raw) {
  const name = String(raw || "").trim();
  if (!name) return list;
  if (list.some((s) => s.toLowerCase() === name.toLowerCase())) return list;
  return [...list, name];
}
