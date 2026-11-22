// src/lib/botBrain.js
// The "receptionist": plain rules, no AI, no paid services. She can only say things
// written in her text files, taught in the bot_knowledge table, or taken from real
// business rows. v2 adds: forgiving typos, remembering the conversation, knowing who is
// open right now, the latest updates, and how the business accounts work.
import { norm, searchBusinesses, extractKeywords } from "@/lib/businessSearch";
import { SITE } from "@/lib/bot/siteRules";
import { BOT_NAME, SMALL, T, EXTRA_T, MENU_T, NEW_T } from "@/lib/bot/botText";
import { tokens, detectLang, smallTalkIntent, followUpAsk, anyPhrase, scorePhrases, OPEN_NOW, SPECIALS } from "@/lib/bot/botIntent";
import { OWNER_TOPICS } from "@/lib/bot/botOwnerHelp";
import { PRONOUNS, TOWN_PHRASES, TOWN, OWNER_EXTRA, OWNER_HAVE } from "@/lib/bot/botExtras";
import { findByName, openNowList, correctQuery, latestUpdates } from "@/lib/bot/botLive";
import { aboutBusinesses } from "@/lib/bot/botFollowUp";

export { BOT_NAME };

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const padded = (s) => ` ${norm(s)} `;
const hasNorm = (p, phrase) => p.includes(` ${norm(phrase)} `);
const anyNorm = (p, list) => list.some((w) => hasNorm(p, w));
const wordCountN = (p) => p.trim().split(" ").filter(Boolean).length;
const MAX_SHOWN = 5;

// "I want to open a restaurant" is about the person, not a follow-up about the last business
const FIRST_PERSON = new Set(["i", "im", "ive", "we", "ek", "want", "wil", "need", "looking", "soek"]);

// Words that only say "open now", so they are not part of what is being searched for
const OPEN_WORDS = new Set([
  "who", "wie", "is", "are", "open", "oop", "now", "nou", "right", "at", "the", "moment", "this", "evening", "today",
  "vandag", "op", "die", "oomblik", "what", "wat", "shops", "places", "plekke", "any", "enige", "that", "wat",
]);

// Best owner-help topic and how strongly it matched (botOwnerHelp phrases plus the extras)
function ownerMatch(toks) {
  let best = null;
  let bestScore = 0;
  for (const topic of OWNER_TOPICS) {
    const s = scorePhrases(toks, [...topic.phrases, ...(OWNER_EXTRA[topic.id] || [])]);
    if (s > bestScore) {
      best = topic;
      bestScore = s;
    }
  }
  return { topic: best, score: bestScore };
}

// ---------------------------------------------------------------- events
const EVENT_WORDS = [
  "event", "events", "gebeurtenis", "gebeurtenisse", "gebeure", "gebeur", "whats on", "what is on",
  "whats happening", "what is happening", "happening", "aan die gang", "funksie", "funksies",
];
const EVENT_FILLER = new Set([
  "event", "events", "gebeurtenis", "gebeurtenisse", "gebeure", "gebeur", "happening", "whats", "watse",
  "which", "naweek", "weekend", "hierdie", "this", "die", "vanaand", "tonight", "today", "vandag",
  "more", "tomorrow", "volgende", "next", "week", "coming", "upcoming", "komende", "gang", "funksie",
  "funksies", "on", "is", "daar", "there", "any", "enige",
]);

// Only trust a date if it clearly includes the year; otherwise keep the event.
function parseEventDate(str) {
  const s = (str || "").toString();
  if (!/\b20\d{2}\b/.test(s)) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function eventsReply(events, q, lang) {
  const X = EXTRA_T[lang] || EXTRA_T.af;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = events.filter((e) => {
    const d = parseEventDate(e.date);
    return !d || d >= startOfToday;
  });
  if (upcoming.length === 0) {
    return { text: X.evNone, links: [{ href: "/list-your-event", label: X.listEvent }] };
  }
  const extras = extractKeywords(q).filter((w) => !EVENT_FILLER.has(w) && w.length >= 3);
  let list = upcoming;
  if (extras.length > 0) {
    const hay = (e) => norm([e.title, e.description, e.location].join(" "));
    const matched = upcoming.filter((e) => extras.some((w) => hay(e).includes(norm(w))));
    if (matched.length > 0) list = matched;
  }
  list = list.slice(0, 5);
  return {
    text: list.length === 1 ? X.evOne : X.evMany,
    events: list,
    links: [{ href: "/list-your-event", label: X.listEvent }],
  };
}

// ---------------------------------------------------------------- menus
const MENU_WORDS = ["menu", "menus", "spyskaart", "spyskaarte", "order food", "bestel kos", "kos bestel", "order online"];
const MENU_FILLER = new Set([
  "menu", "menus", "spyskaart", "spyskaarte", "order", "food", "bestel", "kos", "online", "kyk", "see",
  "view", "show", "wys", "ek", "soek", "n", "'n",
]);

// ---------------------------------------------------------------- greeting
export function getGreeting(lang, owner) {
  if (owner && owner.count > 0) return NEW_T[lang].ownerGreet(owner.count);
  return pick(SMALL[lang].greet);
}
export function getGreetingReply(lang, owner) {
  const links = owner && owner.count > 0 ? [{ href: "/my-business", label: NEW_T[lang].dashboard }] : undefined;
  return { text: getGreeting(lang, owner), links };
}

// What she offers after "who are you" / "help"
function startChips(lang) {
  const X = NEW_T[lang];
  return [
    { label: X.sgWhoOpen, query: lang === "en" ? "who is open now" : "wie is nou oop" },
    { label: X.sgNew, query: lang === "en" ? "what's new" : "wat is nuut" },
    { label: X.sgOwner, query: lang === "en" ? "I have a business" : "ek het n besigheid" },
  ];
}

function resultsReply(found, text, extra = {}) {
  const shown = found.slice(0, MAX_SHOWN);
  return { text, results: shown, memory: { focus: shown.map((b) => b.id) }, ...extra };
}

function followChips(shown, lang) {
  const X = NEW_T[lang];
  const chips = [];
  if (shown.some((b) => b.hours && String(b.hours).trim())) chips.push({ label: X.sgOpenNow, query: lang === "en" ? "are they open now" : "is hulle nou oop" });
  if (shown.some((b) => b.contact && String(b.contact).trim())) chips.push({ label: X.sgNumber, query: lang === "en" ? "their number" : "hul nommer" });
  if (shown.some((b) => b.address && String(b.address).trim())) chips.push({ label: X.sgAddress, query: lang === "en" ? "where are they" : "waar is hulle" });
  return chips.slice(0, 3);
}

// Main entry. Returns { text, links, results, events, updates, suggest, memory, unanswered, logAs }.
export function getReply(opts) {
  const { query, businesses = [], knowledge = [], events = null, menu = null, updates = null, memory = null, owner = null } = opts;
  const now = opts.now || new Date();
  const q = (query || "").trim();
  const lang = detectLang(q, opts.lang || "af");
  const toks = tokens(q);
  const p = padded(q);
  const L = SMALL[lang] || SMALL.af;
  const X = NEW_T[lang];
  const tt = T[lang] || T.af;
  const browse = { href: "/besighede", label: tt.browse };

  // 1) small talk (short messages only, so real questions are not hijacked)
  const talk = smallTalkIntent(toks);
  if (talk === "greet") {
    const g = getGreetingReply(lang, owner);
    return g.links ? g : { text: pick(L.greet) };
  }
  if (talk === "about") return { text: pick(L.about), suggest: startChips(lang) };
  if (talk === "help") return { text: pick(L.help), suggest: startChips(lang) };
  if (talk && L[talk]) return { text: pick(L[talk]) };

  // 2) your own taught answers (bot_knowledge table) are checked first, then compared with owner help below
  let bestK = null;
  let bestKScore = 0;
  for (const row of knowledge) {
    const score = (row.keywords || []).reduce((s, k) => (hasNorm(p, k) ? s + wordCountN(padded(k)) : s), 0);
    if (score > bestKScore) {
      bestK = row;
      bestKScore = score;
    }
  }
  // 3) business owners: how the accounts and tools work.
  // A taught answer only wins when it matched more words than the owner help did.
  const own = ownerMatch(toks);
  if (own.topic && own.score > bestKScore) {
    if (own.topic.id === "claim" && owner && owner.count > 0) {
      const H = OWNER_HAVE[lang] || OWNER_HAVE.af;
      return { text: H.text, links: [{ href: "/my-business", label: X.dashboard }], suggest: H.chips };
    }
    const c = own.topic[lang] || own.topic.af;
    // some links only carry af/en names (like the dashboard button), so fill in the label for this language
    const links = (c.links || []).map((l) => ({ href: l.href, label: l.label || l[lang] || l.af || l.en || "→" }));
    return { text: c.text, links };
  }
  if (bestK) {
    const text = (lang === "en" ? bestK.answer_en : null) || bestK.answer_af;
    const label = (lang === "en" ? bestK.link_label_en : null) || bestK.link_label_af || "→";
    return { text, links: bestK.link ? [{ href: bestK.link, label }] : [] };
  }

  // 3b) "tell me about Brandfort"
  if (toks.length <= 9 && anyPhrase(toks, TOWN_PHRASES)) {
    const Tn = TOWN[lang] || TOWN.af;
    return { text: Tn.text, links: Tn.links, suggest: Tn.chips };
  }

  // 4) about one business: "is Darnikki's open?" or, after a search, "are they open?"
  const ask = followUpAsk(toks);
  if (ask) {
    let targets = findByName(businesses, toks);
    const refersBack = toks.some((w) => PRONOUNS.has(w)); // "can I order from THEM?"
    if (!targets.length && memory && memory.focus && memory.focus.length && toks.length <= 7 && (refersBack || (ask !== "menu" && !toks.some((w) => FIRST_PERSON.has(w))))) {
      targets = memory.focus.map((id) => businesses.find((b) => b.id === id)).filter(Boolean);
    }
    if (targets.length) return aboutBusinesses({ ask, targets, lang, now, menu });
  }

  // 5) what is new / specials
  if (Array.isArray(updates) && toks.length <= 7 && anyPhrase(toks, SPECIALS)) {
    const list = latestUpdates(updates, businesses, { now });
    if (!list || list.length === 0) return { text: X.specialsNone, links: [browse] };
    return { text: X.specialsIntro, updates: list, links: [browse] };
  }

  // 6) who is open right now
  if (anyPhrase(toks, OPEN_NOW)) {
    const rest = toks.filter((w) => !OPEN_WORDS.has(w)).join(" ");
    let pool = businesses;
    if (rest && extractKeywords(rest).length > 0) pool = searchBusinesses(businesses, rest);
    const { open, unknown } = openNowList(pool, now);
    if (open.length === 0) return { text: X.openNowNone, links: [browse], memory: { focus: [] } };
    const shown = open.slice(0, MAX_SHOWN).map((o) => o.b);
    const head = open.length === 1 ? X.openNowOne : X.openNowMany(open.length);
    return resultsReply(shown, unknown > 0 ? `${head}\n${X.openUnknown}` : head, {
      links: open.length > MAX_SHOWN ? [browse] : undefined,
      suggest: followChips(shown, lang),
    });
  }

  // 7) pointing people around the site (longest matching phrase wins)
  let bestS = null;
  let bestSScore = 0;
  for (const rule of SITE) {
    if (rule.block && rule.block.some((re) => re.test(p))) continue;
    let score = rule.words.reduce((s, w) => (hasNorm(p, w) ? Math.max(s, wordCountN(padded(w))) : s), 0);
    if (rule.only && rule.only.some((o) => norm(o) === norm(q))) score = Math.max(score, 5);
    if (score > bestSScore) {
      bestS = rule;
      bestSScore = score;
    }
  }

  // 7a) "do you have a menu?" -> the businesses that have one
  if (menu && anyNorm(p, MENU_WORDS) && extractKeywords(q).every((w) => MENU_FILLER.has(w))) {
    const M = MENU_T[lang] || MENU_T.af;
    const withMenu = businesses.filter((b) => menu[b.id] && menu[b.id] !== "enquiry");
    if (withMenu.length === 0) return { text: M.none };
    return resultsReply(withMenu, withMenu.length > MAX_SHOWN ? M.top(withMenu.length, MAX_SHOWN) : M.some, {
      links: withMenu.length > MAX_SHOWN ? [browse] : undefined,
    });
  }

  // 7b) real events from the database (only when the list has been loaded)
  if (Array.isArray(events) && anyNorm(p, EVENT_WORDS) && !(bestS && bestS.id === "list-event")) {
    return eventsReply(events, q, lang);
  }

  if (bestS) {
    const c = bestS[lang] || bestS.af;
    const links = [{ href: bestS.href, label: c.label }];
    if (bestS.extra) links.push({ href: bestS.extra.href, label: bestS.extra[lang] || bestS.extra.af });
    return { text: c.text, links };
  }

  // 8) real businesses from the database
  const found = searchBusinesses(businesses, q);
  if (found.length > 0) {
    let text = found.length === 1 ? tt.one(1) : found.length > MAX_SHOWN ? tt.top(found.length, MAX_SHOWN) : tt.many(found.length);
    const asksHours =
      /\b\d{1,2}[:h.]\d{2}\b/.test(q) ||
      anyNorm(p, ["oop is", "oop na", "oop naweek", "open late", "open after", "open on", "laat oop", "24 uur", "24 hours",
        "ure", "opening hours", "trading hours", "sluit", "closing time"]);
    if (asksHours) {
      const anyHours = found.slice(0, MAX_SHOWN).some((b) => b.hours && String(b.hours).trim());
      const E = EXTRA_T[lang] || EXTRA_T.af;
      text += " " + (anyHours ? E.hoursSeen : tt.hours);
    }
    const shown = found.slice(0, MAX_SHOWN);
    return resultsReply(found, text, {
      links: found.length > MAX_SHOWN ? [browse] : undefined,
      logAs: asksHours ? `[ure] ${q}`.slice(0, 200) : undefined,
      suggest: followChips(shown, lang),
    });
  }

  // 8b) a typo? ("plummer" -> "plumber")
  const fix = correctQuery(businesses, toks);
  if (fix) {
    const fixedFound = searchBusinesses(businesses, fix.fixed);
    if (fixedFound.length > 0) {
      const shown = fixedFound.slice(0, MAX_SHOWN);
      return resultsReply(fixedFound, `${X.typoNote(fix.fixed)}`, {
        links: fixedFound.length > MAX_SHOWN ? [browse] : undefined,
        suggest: followChips(shown, lang),
      });
    }
  }

  // 8c) the words match an event title (e.g. "markdag") even though they did not say "event"
  if (Array.isArray(events) && events.length > 0) {
    const kw = extractKeywords(q).filter((w) => w.length >= 4);
    const hit = events.filter((e) => kw.some((w) => norm(e.title).includes(norm(w))));
    if (hit.length > 0) return eventsReply(hit, q, lang);
  }

  // 9) nothing found: be honest, point to the directory, and log it so she can be taught
  return { text: tt.none(q), links: [browse], suggest: startChips(lang), unanswered: true };
}
