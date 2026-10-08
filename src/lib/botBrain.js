// src/lib/botBrain.js
// The "receptionist": plain if/else rules, no AI. It can only say things
// written here, in the bot_knowledge table, or taken from real business rows.
import { norm, searchBusinesses, extractKeywords } from "@/lib/businessSearch";
import { SITE } from "@/lib/bot/siteRules";

// Her name. Change it here and it changes everywhere.
export const BOT_NAME = "Lientjie";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const padded = (s) => ` ${norm(s)} `;
const has = (p, phrase) => p.includes(` ${norm(phrase)} `);
const anyPhrase = (p, list) => list.some((w) => has(p, w));
const wordCount = (p) => p.trim().split(" ").filter(Boolean).length;

// ---------------------------------------------------------------- small talk
const GREET_WORDS = new Set(
  [norm(BOT_NAME), "hi", "hello", "hey", "hallo", "haai", "hoesit", "howzit", "goeie", "more", "middag", "aand",
   "dag", "good", "morning", "afternoon", "evening", "there", "daar", "ontvangs", "bulletin", "ons"]
);
const THANKS = ["thanks", "thank you", "thx", "cheers", "dankie", "baie dankie", "dankie tog", "lekker dankie"];
const BYE = ["bye", "goodbye", "totsiens", "ciao", "later", "sien jou", "see you"];
const HOW_ARE_YOU = ["how are you", "how is it going", "hoe gaan dit", "hoe gaan dit met jou", "hoe lyk dit"];
const WHO = ["who are you", "what are you", "what can you do", "wie is jy", "wat is jy", "wat kan jy doen", "wat doen jy"];
const ARE_YOU_BOT = ["are you a bot", "are you real", "are you human", "is jy n bot", "is jy n mens", "is jy regtig"];

const SMALL = {
  af: {
    greet: ["Hi daar! 👋 Ek is " + BOT_NAME + ". Vra my waar jy iets kan kry, of waarheen jy moet gaan.",
            "Haai! 👋 Waarmee kan ek help vandag?"],
    how: ["Goed, dankie! En met jou? Waarmee kan ek help?"],
    thanks: ["Plesier! 😊 Sê net as jy nog iets nodig het.", "Dis 'n plesier! Ek is hier as jy my weer nodig het."],
    bye: ["Totsiens! Kom kuier weer. 👋"],
    who: ["Ek is " + BOT_NAME + ", die Bulletin se ontvangs. Ek help jou besighede, werk, gebeurtenisse en nog meer in Brandfort kry. Probeer: 'n loodgieter, werk, of iets om te verkoop."],
    bot: ["Ek is 'n program, nie 'n mens nie. 😊 Ek wys jou net waar alles op die Bulletin is, en die inligting kom van mense wat die Bulletin bou."],
  },
  en: {
    greet: ["Hi there! 👋 I'm " + BOT_NAME + ". Ask me where to find something or where to go.",
            "Hey! 👋 What can I help you with today?"],
    how: ["Good, thanks! And you? What can I help with?"],
    thanks: ["My pleasure! 😊 Just say if you need anything else.", "No problem! I'm here if you need me again."],
    bye: ["Bye! Come visit again. 👋"],
    who: ["I'm " + BOT_NAME + ", the Bulletin's receptionist. I help you find businesses, jobs, events and more in Brandfort. Try: a plumber, jobs, or something to sell."],
    bot: ["I'm a program, not a person. 😊 I just point you to things on the Bulletin, and the info comes from the people building it."],
  },
};

const T = {
  af: {
    one: (n) => `Ek het ${n} plek gevind wat kan help:`,
    many: (n) => `Ek het ${n} plekke gevind wat kan help:`,
    none: (q) => `Haai, ek kon niks vind vir "${q}" nie. 🙈 Probeer ander woorde, of blaai deur al ons besighede. Ek het jou vraag vir die span gestuur sodat hulle my kan leer.`,
    browse: "🏪 Blaai deur besighede",
    top: (n, k) => `Ek het ${n} plekke gevind. Hier is die eerste ${k}:`,
    hours: "Let wel: ek kan nie sien wie op daardie tyd oop is nie. Bel die besigheid of kyk by sy bladsy om seker te maak.",
  },
  en: {
    one: (n) => `I found ${n} place that can help:`,
    many: (n) => `I found ${n} places that can help:`,
    none: (q) => `Hmm, I couldn't find anything for "${q}". 🙈 Try different words, or browse all our businesses. I've sent your question to the team so they can teach me.`,
    browse: "🏪 Browse businesses",
    top: (n, k) => `I found ${n} places. Here are the first ${k}:`,
    hours: "Note: I can't see who is open at that time. Call the business or check its page to be sure.",
  },
};

// ------------------------------------------------------------------ events
// Used when the real events list has been loaded from the database.
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

const EXTRA_T = {
  af: {
    evMany: "Hier is die gebeurtenisse wat nou gelys is. Kyk na die datum op elke kaart:",
    evOne: "Daar is 1 gebeurtenis gelys. Kyk na die datum op die kaart:",
    evNone: "Daar is nou nie gebeurtenisse gelys nie. Weet jy van een? Lys dit gerus, dan sien almal dit.",
    listEvent: "📅 Lys My Gebeurtenis",
    hoursSeen: "Kyk na die ure op elke kaart. Ek kan nie self sê wie op daardie tyd oop is nie.",
  },
  en: {
    evMany: "Here are the events currently listed. Check the date on each card:",
    evOne: "There is 1 event listed. Check the date on the card:",
    evNone: "There are no events listed right now. Know of one? Please list it so everyone can see it.",
    listEvent: "📅 List My Event",
    hoursSeen: "Check the hours on each card. I can't tell you myself who is open at that time.",
  },
};

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

  // If they asked about something specific ("braai", "markdag"), try to match it
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

// ------------------------------------------------------------------- menus
const MENU_WORDS = ["menu", "menus", "spyskaart", "spyskaarte", "order food", "bestel kos", "kos bestel", "order online"];
const MENU_FILLER = new Set([
  "menu", "menus", "spyskaart", "spyskaarte", "order", "food", "bestel", "kos", "online", "kyk", "see",
  "view", "show", "wys", "ek", "soek", "n", "'n",
]);
const MENU_T = {
  af: {
    some: "Hierdie besighede het 'n menu op die Bulletin. Tik op 🍽️ Kyk menu om te sien:",
    top: (n, k) => `${n} besighede het 'n menu op die Bulletin. Hier is die eerste ${k}:`,
    none: "Nog geen besighede het 'n menu op die Bulletin nie. Ek sal hulle aanmoedig! 😊",
  },
  en: {
    some: "These businesses have a menu on the Bulletin. Tap 🍽️ View menu to see it:",
    top: (n, k) => `${n} businesses have a menu on the Bulletin. Here are the first ${k}:`,
    none: "No businesses have a menu on the Bulletin yet. I'll encourage them! 😊",
  },
};

export function getGreeting(lang) {
  return pick(SMALL[lang].greet);
}

// Main entry. Returns { text, links, results, unanswered }.
export function getReply({ query, lang = "af", businesses = [], knowledge = [], events = null, menu = null }) {
  const q = (query || "").trim();
  const p = padded(q);
  const words = wordCount(p);
  const L = SMALL[lang] || SMALL.af;

  // 1) small talk (only when the message is short, so real questions are not hijacked)
  if (words > 0 && p.trim().split(" ").every((w) => GREET_WORDS.has(w))) return { text: pick(L.greet) };
  if (words <= 6 && anyPhrase(p, ARE_YOU_BOT)) return { text: pick(L.bot) };
  if (words <= 6 && anyPhrase(p, WHO)) return { text: pick(L.who) };
  if (words <= 6 && anyPhrase(p, HOW_ARE_YOU)) return { text: pick(L.how) };
  if (words <= 7 && anyPhrase(p, THANKS)) return { text: pick(L.thanks) };
  if (words <= 4 && anyPhrase(p, BYE)) return { text: pick(L.bye) };

  // 2) your own taught answers (bot_knowledge table) beat everything else
  let bestK = null;
  let bestKScore = 0;
  for (const row of knowledge) {
    const score = (row.keywords || []).reduce((s, k) => (has(p, k) ? s + wordCount(padded(k)) : s), 0);
    if (score > bestKScore) {
      bestK = row;
      bestKScore = score;
    }
  }
  if (bestK) {
    const text = (lang === "en" ? bestK.answer_en : null) || bestK.answer_af;
    const label = (lang === "en" ? bestK.link_label_en : null) || bestK.link_label_af || "→";
    return { text, links: bestK.link ? [{ href: bestK.link, label }] : [] };
  }

  // 3) pointing people around the site (longest matching phrase wins)
  let bestS = null;
  let bestSScore = 0;
  for (const rule of SITE) {
    if (rule.block && rule.block.some((re) => re.test(p))) continue;
    let score = rule.words.reduce((s, w) => (has(p, w) ? Math.max(s, wordCount(padded(w))) : s), 0);
    if (rule.only && rule.only.some((o) => norm(o) === norm(q))) score = Math.max(score, 5);
    if (score > bestSScore) {
      bestS = rule;
      bestSScore = score;
    }
  }
  // 3a) "do you have a menu?" -> the businesses that have one
  if (menu && anyPhrase(p, MENU_WORDS) && extractKeywords(q).every((w) => MENU_FILLER.has(w))) {
    const M = MENU_T[lang] || MENU_T.af;
    const tt = T[lang] || T.af;
    const withMenu = businesses.filter((b) => menu[b.id] && menu[b.id] !== "enquiry");
    if (withMenu.length === 0) return { text: M.none };
    const shown = withMenu.slice(0, 5);
    return {
      text: withMenu.length > 5 ? M.top(withMenu.length, 5) : M.some,
      results: shown,
      links: withMenu.length > 5 ? [{ href: "/besighede", label: tt.browse }] : undefined,
    };
  }

  // 3b) real events from the database (only when the list has been loaded)
  if (Array.isArray(events) && anyPhrase(p, EVENT_WORDS) && !(bestS && bestS.id === "list-event")) {
    return eventsReply(events, q, lang);
  }

  if (bestS) {
    const c = bestS[lang] || bestS.af;
    const links = [{ href: bestS.href, label: c.label }];
    if (bestS.extra) links.push({ href: bestS.extra.href, label: bestS.extra[lang] || bestS.extra.af });
    return { text: c.text, links };
  }

  // 4) real businesses from the database
  const found = searchBusinesses(businesses, q);
  if (found.length > 0) {
    const tt = T[lang] || T.af;
    const MAX_SHOWN = 5;
    const shown = found.slice(0, MAX_SHOWN);
    let text =
      found.length === 1
        ? tt.one(1)
        : found.length > MAX_SHOWN
        ? tt.top(found.length, MAX_SHOWN)
        : tt.many(found.length);

    // Opening-hours questions: we do not have that data, so say so and tell the team
    const asksHours =
      /\b\d{1,2}[:h.]\d{2}\b/.test(q) ||
      anyPhrase(p, ["oop is", "oop nou", "oop na", "oop vandag", "oop naweek", "open now", "open late",
                    "open after", "open on", "laat oop", "24 uur", "24 hours", "ure", "opening hours",
                    "trading hours", "sluit", "closing time"]);
    if (asksHours) {
      const anyHours = shown.some((b) => b.hours && String(b.hours).trim());
      const X = EXTRA_T[lang] || EXTRA_T.af;
      text += " " + (anyHours ? X.hoursSeen : tt.hours);
    }

    return {
      text,
      results: shown,
      links: found.length > MAX_SHOWN ? [{ href: "/besighede", label: tt.browse }] : undefined,
      logAs: asksHours ? `[ure] ${q}`.slice(0, 200) : undefined,
    };
  }

  // 4b) the words match an event title (e.g. "markdag") even though they did not say "event"
  if (Array.isArray(events) && events.length > 0) {
    const kw = extractKeywords(q).filter((w) => w.length >= 4);
    const hit = events.filter((e) => kw.some((w) => norm(e.title).includes(norm(w))));
    if (hit.length > 0) return eventsReply(hit, q, lang);
  }

  // 5) nothing found: be honest, point to the directory, and log it so we can teach her
  const tt = T[lang] || T.af;
  return { text: tt.none(q), links: [{ href: "/besighede", label: tt.browse }], unanswered: true };
}
