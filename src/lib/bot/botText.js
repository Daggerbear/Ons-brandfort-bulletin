// src/lib/bot/botText.js
// Everything Lientjie says in plain words, in Afrikaans and English.

// Her name. Change it here and it changes everywhere.
export const BOT_NAME = "Lientjie";

export const SMALL = {
  af: {
    greet: ["Hi daar! 👋 Ek is " + BOT_NAME + ". Vra my waar jy iets kan kry, of waarheen jy moet gaan.",
            "Haai! 👋 Waarmee kan ek help vandag?"],
    how: ["Goed, dankie! En met jou? Waarmee kan ek help?"],
    thanks: ["Plesier! 😊 Sê net as jy nog iets nodig het.", "Dis 'n plesier! Ek is hier as jy my weer nodig het."],
    bye: ["Totsiens! Kom kuier weer. 👋"],
    who: ["Ek is " + BOT_NAME + ", die Bulletin se ontvangs. Ek help jou besighede, werk, gebeurtenisse en nog meer in Brandfort kry. Probeer: 'n loodgieter, werk, of iets om te verkoop."],
    bot: ["Ek is 'n program, nie 'n mens nie. 😊 Ek wys jou net waar alles op die Bulletin is, en die inligting kom van mense wat die Bulletin bou."],
    about: ["Ek is " + BOT_NAME + ", die Bulletin se ontvangs. 👋\nEk kan:\n• besighede, werk en gebeurtenisse in Brandfort vir jou kry\n• sê of 'n besigheid nou oop is\n• wys wat nuut en spesiaal is\n• besigheidseienaars wys hoe hulle rekening werk\nVra my gerus! Ek stoor net jou vraag, nie wie jy is nie."],
    help: ["Vra my soos jy 'n ontvangsdame sou vra. 😊\nBv. \"loodgieter\", \"wie is nou oop?\", \"wat is nuut?\", \"hoe verander ek my logo?\""],
  },
  en: {
    greet: ["Hi there! 👋 I'm " + BOT_NAME + ". Ask me where to find something or where to go.",
            "Hey! 👋 What can I help you with today?"],
    how: ["Good, thanks! And you? What can I help with?"],
    thanks: ["My pleasure! 😊 Just say if you need anything else.", "No problem! I'm here if you need me again."],
    bye: ["Bye! Come visit again. 👋"],
    who: ["I'm " + BOT_NAME + ", the Bulletin's receptionist. I help you find businesses, jobs, events and more in Brandfort. Try: a plumber, jobs, or something to sell."],
    bot: ["I'm a program, not a person. 😊 I just point you to things on the Bulletin, and the info comes from the people building it."],
    about: ["I'm " + BOT_NAME + ", the Bulletin's receptionist. 👋\nI can:\n• find businesses, jobs and events in Brandfort\n• tell you if a business is open right now\n• show what's new and what's on special\n• show business owners how their account works\nJust ask! I only save your question, not who you are."],
    help: ["Ask me like you'd ask a receptionist. 😊\nFor example \"plumber\", \"who is open now?\", \"what's new?\", \"how do I change my logo?\""],
  },
};

export const T = {
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

export const EXTRA_T = {
  af: {
    evMany: "Hier is die gebeurtenisse wat nou geplaas is. Kyk na die datum op elke kaart:",
    evOne: "Daar is 1 gebeurtenis geplaas. Kyk na die datum op die kaart:",
    evNone: "Daar is nou nie gebeurtenisse geplaas nie. Weet jy van een? Plaas dit gerus, dan sien almal dit.",
    listEvent: "📅 Plaas My Gebeurtenis",
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

export const MENU_T = {
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


// ------------------------------------------------------------------ new in v2
export const DAYS = {
  af: ["Sondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrydag", "Saterdag"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

export const NEW_T = {
  af: {
    ownerGreet: (n) => `Welkom terug! 👋 Jy het ${n === 1 ? "'n besigheid" : n + " besighede"} op die Bulletin. Maak jou dashboard oop, of vra my iets.`,
    dashboard: "📊 Maak my dashboard oop",

    openNowMany: (n) => `Dié ${n} plekke is nou oop (volgens hul ure):`,
    openNowOne: "Hierdie plek is nou oop (volgens sy ure):",
    openNowNone: "Ek kan nie nou 'n oop plek vir jou vind nie. 🙈 Nie almal het hul ure op die Bulletin nie, so bel gerus eers.",
    openUnknown: "Besighede sonder ure op die Bulletin kon ek nie nagaan nie.",

    sOpen: (n, until) => `✅ ${n} is nou oop tot ${until}.`,
    sAlways: (n) => `✅ ${n} is 24 uur oop.`,
    sClosed: (n, when) => `⏰ ${n} is nou toe. Maak weer oop ${when}.`,
    sClosedNone: (n) => `⏰ ${n} is nou toe.`,
    sUnknown: (n, raw) =>
      raw ? `🕒 ${n} se ure: ${raw}. Ek kan nie met sekerheid sê of hulle nou oop is nie.` : `🕒 ${n} het nog nie ure op die Bulletin nie. Bel hulle om seker te maak.`,
    today: (t) => `vandag om ${t}`,
    tomorrow: (t) => `môre om ${t}`,
    onDay: (d, t) => `${d} om ${t}`,

    phoneLine: (n, num) => `📞 ${n}: ${num}`,
    phoneNone: (n) => `${n} het nog nie 'n nommer op die Bulletin nie.`,
    wa: "💬 WhatsApp",
    call: "📞 Bel",
    addressLine: (n, a) => `📍 ${n} is by ${a}.`,
    addressNone: (n) => `${n} het nog nie 'n adres op die Bulletin nie.`,
    maps: "📍 Wys op kaart",
    menuLine: (n) => `🍽️ Kyk hier om by ${n} te bestel:`,
    menuNone: (n) => `${n} het nog nie 'n spyskaart op die Bulletin nie.`,
    viewMenu: "🍽️ Kyk spyskaart",
    page: "🏪 Maak bladsy oop",
    moreServices: "Dienste",

    specialsIntro: "Dit is die nuutste van die besighede:",
    specialsNone: "Daar is nou nie nuwe opdaterings nie. Kyk weer later, of blaai deur die besighede.",

    didYouMean: (w) => `Ek kon niks vind nie. Bedoel jy ${w}?`,
    typoNote: (f) => `Ek dink jy bedoel "${f}". Dit is wat ek gevind het:`,

    sgOpenNow: "🕒 Is hulle nou oop?",
    sgNumber: "📞 Hul nommer",
    sgAddress: "📍 Waar is hulle?",
    sgWhoOpen: "🕒 Wie is nou oop?",
    sgNew: "🔥 Wat is nuut?",
    sgOwner: "🏪 Ek het 'n besigheid",
    sgYes: "Ja",
  },
  en: {
    ownerGreet: (n) => `Welcome back! 👋 You have ${n === 1 ? "a business" : n + " businesses"} on the Bulletin. Open your dashboard, or ask me something.`,
    dashboard: "📊 Open my dashboard",

    openNowMany: (n) => `These ${n} places are open right now (going by their hours):`,
    openNowOne: "This place is open right now (going by its hours):",
    openNowNone: "I can't find an open place for you right now. 🙈 Not everyone has their hours on the Bulletin, so it's worth calling first.",
    openUnknown: "I couldn't check businesses that have no hours on the Bulletin.",

    sOpen: (n, until) => `✅ ${n} is open now until ${until}.`,
    sAlways: (n) => `✅ ${n} is open 24 hours.`,
    sClosed: (n, when) => `⏰ ${n} is closed right now. Opens again ${when}.`,
    sClosedNone: (n) => `⏰ ${n} is closed right now.`,
    sUnknown: (n, raw) =>
      raw ? `🕒 ${n}'s hours: ${raw}. I can't say for sure if they're open right now.` : `🕒 ${n} hasn't put hours on the Bulletin yet. Call them to be sure.`,
    today: (t) => `today at ${t}`,
    tomorrow: (t) => `tomorrow at ${t}`,
    onDay: (d, t) => `${d} at ${t}`,

    phoneLine: (n, num) => `📞 ${n}: ${num}`,
    phoneNone: (n) => `${n} hasn't put a number on the Bulletin yet.`,
    wa: "💬 WhatsApp",
    call: "📞 Call",
    addressLine: (n, a) => `📍 ${n} is at ${a}.`,
    addressNone: (n) => `${n} hasn't put an address on the Bulletin yet.`,
    maps: "📍 Show on map",
    menuLine: (n) => `🍽️ Order from ${n} here:`,
    menuNone: (n) => `${n} doesn't have a menu on the Bulletin yet.`,
    viewMenu: "🍽️ View menu",
    page: "🏪 Open page",
    moreServices: "Services",

    specialsIntro: "Here's the latest from businesses:",
    specialsNone: "There are no new updates right now. Check back later, or browse the businesses.",

    didYouMean: (w) => `I couldn't find anything. Did you mean ${w}?`,
    typoNote: (f) => `I think you mean "${f}". Here's what I found:`,

    sgOpenNow: "🕒 Are they open now?",
    sgNumber: "📞 Their number",
    sgAddress: "📍 Where are they?",
    sgWhoOpen: "🕒 Who is open now?",
    sgNew: "🔥 What's new?",
    sgOwner: "🏪 I have a business",
    sgYes: "Yes",
  },
};
