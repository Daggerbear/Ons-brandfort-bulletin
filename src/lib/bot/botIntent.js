// src/lib/bot/botIntent.js
// Understanding what someone means, without AI: tidy the words, forgive typos,
// and score the message against lists of phrases. Everything here is plain code.

// ---------------------------------------------------------------- words
export const normText = (s) =>
  String(s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const tokens = (s) => normText(s).split(" ").filter(Boolean);

// Edit distance, stopping early once it is bigger than `max`
export function lev(a, b, max = 2) {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

// Same word, allowing a typo in longer words ("plummer" ~ "plumber")
export function sameWord(a, b) {
  if (a === b) return true;
  const short = Math.min(a.length, b.length);
  if (short >= 9) return lev(a, b, 2) <= 2;
  if (short >= 5) return lev(a, b, 1) <= 1;
  return false;
}

// Do these tokens contain the phrase (words next to each other)?
export function hasPhrase(toks, phrase) {
  const pt = tokens(phrase);
  if (pt.length === 0) return false;
  for (let i = 0; i + pt.length <= toks.length; i++) {
    let ok = true;
    for (let j = 0; j < pt.length; j++) {
      if (!sameWord(toks[i + j], pt[j])) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

export const anyPhrase = (toks, list) => list.some((p) => hasPhrase(toks, p));

// Longest matching phrase wins (counted in words), like the old keyword scoring
export function scorePhrases(toks, list) {
  let best = 0;
  for (const p of list) {
    if (hasPhrase(toks, p)) best = Math.max(best, tokens(p).length);
  }
  return best;
}

// ---------------------------------------------------------------- language
const AF_ONLY = new Set([
  "hoe", "waar", "wanneer", "ek", "jy", "jou", "my", "julle", "hulle", "nie", "nou", "oop", "asseblief", "dankie",
  "besigheid", "besighede", "soek", "wil", "kan", "moet", "wat", "wie", "hoeveel", "vandag", "môre", "more", "naweek",
  "spyskaart", "bestel", "verander", "plaas", "vertel", "wys", "het", "is", "die", "n", "en", "van", "vir", "met",
  "gaan", "goeie", "baie", "lekker", "eienaar", "aanspraak", "gebeur", "gebeurtenisse",
]);
const EN_ONLY = new Set([
  "how", "where", "when", "i", "you", "your", "my", "they", "them", "the", "is", "are", "what", "who", "can", "want",
  "need", "please", "thanks", "business", "businesses", "looking", "for", "open", "now", "today", "weekend", "menu",
  "order", "change", "post", "tell", "show", "have", "do", "does", "and", "of", "with", "to", "owner", "claim",
]);
// words that only belong to one language (so shared words like "my" or "is" do not count)
const AF_STRONG = new Set([
  "hoe", "waar", "wanneer", "ek", "jy", "jou", "julle", "hulle", "nie", "asseblief", "dankie", "besigheid",
  "besighede", "soek", "wil", "moet", "wat", "wie", "hoeveel", "vandag", "spyskaart", "bestel", "verander", "plaas",
  "vertel", "wys", "het", "gaan", "baie", "lekker", "eienaar", "aanspraak", "oop", "nou", "vir",
]);
const EN_STRONG = new Set([
  "how", "where", "when", "you", "your", "they", "them", "the", "what", "who", "can", "want", "need", "please",
  "thanks", "business", "businesses", "looking", "for", "open", "today", "tell", "show", "have", "owner", "claim",
  "change", "post", "order",
]);
void AF_ONLY;
void EN_ONLY;

// Answer in the language the person wrote in, but only when it is clear
export function detectLang(query, fallback = "af") {
  const toks = tokens(query);
  let af = 0;
  let en = 0;
  toks.forEach((w) => {
    if (AF_STRONG.has(w) && !EN_STRONG.has(w)) af += 1;
    else if (EN_STRONG.has(w) && !AF_STRONG.has(w)) en += 1;
  });
  if (fallback === "en" && af >= 2 && af > en) return "af";
  if (fallback === "af" && en >= 2 && en > af) return "en";
  return fallback;
}

// ---------------------------------------------------------------- small talk
const GREET_WORDS = new Set([
  "lientjie", "hi", "hello", "hey", "hallo", "haai", "hoesit", "howzit", "goeie", "more", "middag", "aand", "dag",
  "good", "morning", "afternoon", "evening", "there", "daar", "ontvangs", "bulletin", "ons", "yo", "hiya",
]);

const SMALL_TALK = [
  ["bot", 7, ["are you a bot", "are you real", "are you human", "are you a robot", "is jy n bot", "is jy n mens", "is jy regtig", "is jy n robot"]],
  ["about", 8, [
    "who are you", "what are you", "what can you do", "what do you do", "tell me about yourself", "about yourself",
    "introduce yourself", "tell me about you", "wie is jy", "wat is jy", "wat kan jy doen", "wat doen jy",
    "vertel my van jouself", "vertel my van jou", "stel jouself voor", "oor jouself", "wie is lientjie", "who is lientjie",
  ]],
  ["how", 7, ["how are you", "how is it going", "how are things", "hoe gaan dit", "hoe gaan dit met jou", "hoe lyk dit", "hoe gaan dit daar"]],
  ["thanks", 7, ["thanks", "thank you", "thx", "thanx", "cheers", "dankie", "baie dankie", "dankie tog", "lekker dankie", "appreciate it"]],
  ["bye", 4, ["bye", "goodbye", "totsiens", "ciao", "later", "sien jou", "see you", "cheers bye"]],
  ["help", 5, ["help", "hulp", "help me", "i need help", "ek het hulp nodig", "wat kan ek vra", "what can i ask", "how does this work", "hoe werk dit"]],
];

// Returns "greet" | "bot" | "about" | "how" | "thanks" | "bye" | "help" | null
export function smallTalkIntent(toks) {
  if (toks.length === 0) return null;
  if (toks.every((w) => GREET_WORDS.has(w))) return "greet";
  for (const [key, maxWords, phrases] of SMALL_TALK) {
    if (toks.length <= maxWords && anyPhrase(toks, phrases)) return key;
  }
  return null;
}

// ---------------------------------------------------------------- follow-ups
// "are they open?", "what is their number?", "where are they?"
export const FOLLOW_UP = [
  ["hours", [
    "open now", "oop nou", "are they open", "is it open", "is hulle oop", "is dit oop", "opening hours", "trading hours",
    "what time do they open", "what time do they close", "hoe laat", "wanneer oop", "wanneer maak", "sluit", "hours",
    "ure", "tye", "closing time", "open today", "oop vandag", "open", "oop", "nou oop", "now open", "what time",
    "close", "closes", "closed", "opens", "when do they open", "wanneer maak hulle oop", "wanneer sluit hulle",
  ]],
  ["phone", ["phone", "phone number", "number", "nommer", "bel", "call", "whatsapp", "telefoon", "cell", "kontaknommer", "contact number", "contact details", "kontakbesonderhede"]],
  ["address", ["address", "adres", "where are they", "waar is hulle", "waar is dit", "where is it", "where is that", "directions", "rigtings", "location", "ligging", "how do i get there", "hoe kom ek daar"]],
  ["menu", ["menu", "spyskaart", "order", "bestel"]],
  ["more", ["tell me more", "more info", "more about", "vertel my meer", "meer inligting", "details", "besonderhede", "services", "dienste", "what do they do", "wat doen hulle", "what do they offer", "prices", "pryse"]],
];
// "contact us" is about the Bulletin, not about the last business
export const NOT_ABOUT_BUSINESS = new Set(["us", "ons", "julle", "bulletin", "team", "span", "admin"]);

export function followUpAsk(toks) {
  if (toks.some((w) => NOT_ABOUT_BUSINESS.has(w))) return null;
  let best = null;
  let bestScore = 0;
  for (const [key, phrases] of FOLLOW_UP) {
    const s = scorePhrases(toks, phrases);
    if (s > bestScore) {
      best = key;
      bestScore = s;
    }
  }
  return best;
}

export const OPEN_NOW = ["open now", "oop nou", "now open", "nou oop", "open right now", "open today", "oop vandag", "open at the moment", "oop op die oomblik", "open this evening", "wie is oop", "who is open"];
export const SPECIALS = ["special", "specials", "spesiaal", "spesiale", "offer", "offers", "aanbod", "aanbiedings", "deal", "deals", "promo", "promotions", "whats new", "wat is nuut", "nuus", "news", "opdaterings", "updates", "latest", "nuutste"];
