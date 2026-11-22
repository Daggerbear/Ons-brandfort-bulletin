// src/lib/bot/botLive.js
// Working with the real businesses and updates: finding one by name, who is open now,
// "did you mean...", and the latest updates.
import { tokens, sameWord, lev } from "./botIntent";
import { openStatus } from "./botHours";

// Words that appear in questions, not in business names
const QUESTION_WORDS = new Set([
  "open", "oop", "now", "nou", "today", "vandag", "hours", "ure", "tye", "phone", "number", "nommer", "address", "adres",
  "where", "waar", "when", "wanneer", "what", "wat", "time", "hoe", "laat", "close", "closing", "sluit", "menu",
  "spyskaart", "order", "bestel", "call", "contact", "kontak", "whatsapp", "details", "more", "meer", "tell", "vertel",
  "directions", "location", "services", "dienste", "prices", "pryse", "they", "hulle", "their", "hul", "does", "have",
  "business", "besigheid", "brandfort", "please", "asseblief", "about", "oor", "this", "that", "dit", "daar", "there",
]);
// Words that are part of many business names and do not identify one
const GENERIC_NAME = new Set([
  "the", "and", "pty", "ltd", "bpk", "shop", "store", "restaurant", "cafe", "takeaway", "takeaways", "services",
  "service", "supplies", "trading", "enterprises", "group", "centre", "center", "brandfort", "auto", "motors", "motor",
  "garage", "hardware", "boutique", "salon", "liquor", "pub", "grill", "van", "vir", "die", "en",
]);

const nameTokens = (name) => tokens(name).filter((w) => w.length >= 3 && !GENERIC_NAME.has(w));

// Businesses whose name is mentioned in the message ("is darnikkis open?")
export function findByName(businesses, qToks) {
  const q = qToks.filter((w) => !QUESTION_WORDS.has(w));
  const scored = [];
  for (const b of businesses) {
    const nt = nameTokens(b.name);
    if (nt.length === 0) continue;
    const matched = nt.filter((w) => w.length >= 5 && q.some((x) => sameWord(x, w) || (w.length >= 6 && x.length >= 5 && lev(x, w, 1) <= 1))).length;
    if (matched === 0) continue;
    scored.push({ b, matched, ratio: matched / nt.length });
  }
  if (scored.length === 0) return [];
  scored.sort((x, y) => y.matched - x.matched || y.ratio - x.ratio);
  const top = scored[0];
  return scored.filter((s) => s.matched === top.matched).slice(0, 3).map((s) => s.b);
}

// Who is open right now, going by the hours text
export function openNowList(businesses, now = new Date()) {
  const open = [];
  let unknown = 0;
  for (const b of businesses) {
    if (!b.hours || !String(b.hours).trim()) {
      unknown += 1;
      continue;
    }
    const st = openStatus(b.hours, now);
    if (!st.known) unknown += 1;
    else if (st.open) open.push({ b, st });
  }
  return { open, unknown };
}

// ---- "did you mean ..." -----------------------------------------------------
function vocabulary(businesses) {
  const vocab = new Set();
  businesses.forEach((b) => {
    [b.name, b.category, ...(Array.isArray(b.services) ? b.services : [])].forEach((text) =>
      tokens(text).forEach((w) => {
        if (w.length >= 4 && !GENERIC_NAME.has(w)) {
          vocab.add(w);
          if (w.length >= 6 && w.endsWith("s")) vocab.add(w.slice(0, -1)); // plumbers -> plumber
        }
      }),
    );
  });
  return vocab;
}

// -> { fixed: "plumber", changes: [["plummer","plumber"]] } or null
export function correctQuery(businesses, qToks) {
  const vocab = vocabulary(businesses);
  const changes = [];
  const out = qToks.map((w) => {
    if (w.length < 5 || vocab.has(w) || QUESTION_WORDS.has(w)) return w;
    let best = null;
    let bestD = 99;
    for (const v of vocab) {
      const d = lev(w, v, w.length >= 9 ? 2 : 1);
      if (d < bestD && d <= (w.length >= 9 ? 2 : 1)) {
        best = v;
        bestD = d;
      }
    }
    if (best) {
      changes.push([w, best]);
      return best;
    }
    return w;
  });
  return changes.length ? { fixed: out.join(" "), changes } : null;
}

// ---- latest updates --------------------------------------------------------------
export function latestUpdates(updates, businesses, { days = 14, limit = 5, now = new Date() } = {}) {
  if (!Array.isArray(updates)) return null;
  const since = now.getTime() - days * 86400000;
  const byId = new Map(businesses.map((b) => [b.id, b]));
  return updates
    .filter((u) => new Date(u.created_at).getTime() >= since && byId.has(u.business_id))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit)
    .map((u) => ({ ...u, businessName: byId.get(u.business_id).name }));
}
