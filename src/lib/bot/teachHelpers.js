// src/lib/bot/teachHelpers.js
// Small helpers for the "Teach Lientjie" admin page: suggest keywords, pick a page to link to,
// and spot keywords that another taught answer already uses.
import { normText, tokens } from "@/lib/bot/botIntent";

// One-tap buttons: choose a page and the link plus both button texts are filled in for you
export const PAGE_PICKS = [
  { id: "businesses", af: "Besighede", en: "Businesses", link: "/besighede", labelAf: "🏪 Ons Besighede", labelEn: "🏪 Our Businesses" },
  { id: "jobs", af: "Werk", en: "Jobs", link: "/jobs", labelAf: "💼 Gaan na Werk", labelEn: "💼 Go to Jobs" },
  { id: "sell", af: "Koop & Verkoop", en: "Buy & Sell", link: "/classifieds", labelAf: "🛒 Koop & Verkoop", labelEn: "🛒 Buy & Sell" },
  { id: "housing", af: "Behuising", en: "Housing", link: "/housing", labelAf: "🏠 Behuising", labelEn: "🏠 Housing" },
  { id: "event", af: "Plaas gebeurtenis", en: "List event", link: "/list-your-event", labelAf: "📅 Plaas My Gebeurtenis", labelEn: "📅 List My Event" },
  { id: "register", af: "Registreer besigheid", en: "Register business", link: "/list-your-business", labelAf: "🏪 Registreer My Besigheid", labelEn: "🏪 Register My Business" },
  { id: "updates", af: "Besigheidsopdaterings", en: "Business updates", link: "/business-updates", labelAf: "📢 Besigheidsopdaterings", labelEn: "📢 Business Updates" },
  { id: "feed", af: "Gemeenskap Feed", en: "Community Feed", link: "/feed", labelAf: "💬 Gemeenskap Feed", labelEn: "💬 Community Feed" },
  { id: "games", af: "Glitch Cafe", en: "Glitch Cafe", link: "/games", labelAf: "🕹️ Glitch Cafe", labelEn: "🕹️ Glitch Cafe" },
  { id: "emergency", af: "Noodkontakte", en: "Emergency", link: "/emergency", labelAf: "🚨 Noodkontakte", labelEn: "🚨 Emergency Contacts" },
  { id: "contact", af: "Kontak ons", en: "Contact us", link: "/contact", labelAf: "✉️ Kontak Ons", labelEn: "✉️ Contact Us" },
  { id: "mission", af: "Ons Missie", en: "Our Mission", link: "/mission", labelAf: "ℹ️ Ons Missie", labelEn: "ℹ️ Our Mission" },
];

const STOP = new Set([
  "what", "when", "where", "which", "does", "have", "with", "from", "that", "this", "there", "their", "they", "about",
  "wat", "waar", "wanneer", "hoe", "kan", "het", "nie", "vir", "met", "van", "julle", "hulle", "jou", "ons", "daar",
  "dit", "oor", "iets", "enige", "asseblief", "please", "could", "would", "tell", "vertel",
]);

// Remove the [ure] / [nie nuttig] tag the bot adds to some logged questions
export const cleanQuestion = (q) => String(q || "").replace(/^\[[^\]]+\]\s*/, "").trim();

// -> { phrase: "the whole question, tidied" | null, words: ["distinct", "words"] }
export function suggestKeywords(question) {
  const toks = tokens(cleanQuestion(question));
  const phrase = toks.length >= 1 && toks.length <= 6 ? toks.join(" ") : null;
  const words = Array.from(new Set(toks.filter((w) => w.length >= 4 && !STOP.has(w)))).slice(0, 6);
  return { phrase, words: words.filter((w) => w !== phrase) };
}

export const tidyKeyword = (k) => normText(k).slice(0, 40);

// Other taught answers that already use one of these keywords
export function findOverlaps(keywords, knowledge, ignoreId) {
  const mine = new Set(keywords.map(tidyKeyword));
  const out = [];
  for (const row of knowledge || []) {
    if (row.id === ignoreId) continue;
    const shared = (row.keywords || []).filter((k) => mine.has(tidyKeyword(k)));
    if (shared.length) out.push({ keywords: shared, answer: String(row.answer_af || "").slice(0, 70) });
  }
  return out;
}
