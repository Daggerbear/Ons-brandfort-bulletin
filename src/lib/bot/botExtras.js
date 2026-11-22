// src/lib/bot/botExtras.js
// Small add-ons for Lientjie's brain: the "tell me about Brandfort" answer, extra owner phrases,
// what she says to someone who already has a business account, and the "they / hulle" words.

// Words that point back at the business she just talked about ("can I order from them?")
export const PRONOUNS = new Set(["hulle", "hul", "they", "them", "their", "daar", "there", "dit", "it"]);

// ---------------------------------------------------------------- about Brandfort
export const TOWN_PHRASES = [
  "about brandfort", "tell me about brandfort", "what is brandfort", "brandfort info", "about the town",
  "tell me about the town", "oor brandfort", "oor die dorp", "vertel my van brandfort", "vertel my van die dorp",
  "wat is brandfort", "vertel my oor brandfort", "vertel my oor die dorp", "info oor brandfort",
];

// Edit this text in your own words whenever you like. Only say things you know are true.
export const TOWN = {
  af: {
    text: "Brandfort is 'n dorpie in die Vrystaat, noord van Bloemfontein. 🌾\nOp die Bulletin kry jy die dorp se besighede, gebeurtenisse, werk en nuus op een plek, en dis alles gratis.\nWaar wil jy begin?",
    links: [{ href: "/besighede", label: "🏪 Ons Besighede" }, { href: "/mission", label: "ℹ️ Ons Missie" }],
    chips: [
      { label: "🏪 Alle besighede", query: "alle besighede" },
      { label: "🔥 Wat gebeur?", query: "wat gebeur" },
      { label: "🕒 Wie is nou oop?", query: "wie is nou oop" },
    ],
  },
  en: {
    text: "Brandfort is a small town in the Free State, north of Bloemfontein. 🌾\nOn the Bulletin you'll find the town's businesses, events, jobs and news in one place, and it's all free.\nWhere would you like to start?",
    links: [{ href: "/besighede", label: "🏪 Our Businesses" }, { href: "/mission", label: "ℹ️ Our Mission" }],
    chips: [
      { label: "🏪 All businesses", query: "all businesses" },
      { label: "🔥 What's happening?", query: "whats happening" },
      { label: "🕒 Who is open now?", query: "who is open now" },
    ],
  },
};

// ---------------------------------------------------------------- owners
// More ways people ask about their business account (added on top of botOwnerHelp.js)
export const OWNER_EXTRA = {
  claim: [
    "besigheid rekening", "my besigheid rekening", "help my met my besigheid rekening", "help met my besigheid",
    "besigheid account", "my business account", "help with my business account", "help with my business",
    "my besigheid se rekening", "rekening vir my besigheid",
  ],
};

// Said to someone who already has a business on their account and asks "how do I get an account?"
export const OWNER_HAVE = {
  af: {
    text: "Jy het reeds 'n besigheid op die Bulletin. 😊 Jou dashboard het alles: profiel, logo, plasings, statistiek en meer.\nOf vra my iets spesifiek, soos hoe jy jou logo of ure verander.",
    chips: [
      { label: "🖼️ Verander my logo", query: "verander my logo" },
      { label: "🕒 Verander my ure", query: "verander my ure" },
      { label: "📢 Plaas 'n opdatering", query: "plaas n opdatering" },
    ],
  },
  en: {
    text: "You already have a business on the Bulletin. 😊 Your dashboard has everything: profile, logo, posts, statistics and more.\nOr ask me something specific, like how to change your logo or hours.",
    chips: [
      { label: "🖼️ Change my logo", query: "change my logo" },
      { label: "🕒 Change my hours", query: "change my hours" },
      { label: "📢 Post an update", query: "post an update" },
    ],
  },
};
