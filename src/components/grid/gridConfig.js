// src/components/grid/gridConfig.js

// ---------- map size ----------
export const TW = 44; // tile width on screen
export const TH = 22; // tile height on screen
export const N = 20; // the town is N x N tiles
export const ROADS = [5, 10, 15]; // roads run along these rows and columns
export const MAIN_ROAD = 10;

// world bounds (used to keep the camera on the map)
export const MAP = { x0: -440, x1: 440, y0: -130, y1: 450 };

// ---------- the buildings the community funds with BB (in build-queue order) ----------
// "type" picks the look of the finished building
export const SLOTS = [
  { gx: 16, gy: 1, w: 3, d: 3, h: 56, type: "power" }, // Power Grid
  { gx: 2, gy: 2, w: 2, d: 2, h: 96, type: "water" }, // Water Tower
  { gx: 17, gy: 17, w: 2, d: 2, h: 120, type: "radio" }, // Radio Tower
  { gx: 6, gy: 6, w: 3, d: 3, h: 44, type: "arcade" }, // Glitch Cafe Arcade
  { gx: 11, gy: 11, w: 4, d: 3, h: 70, type: "hall" }, // Town Hall
  { gx: 6, gy: 16, w: 2, d: 2, h: 36, type: "small" },
  { gx: 11, gy: 17, w: 2, d: 2, h: 36, type: "small" },
  { gx: 1, gy: 17, w: 2, d: 2, h: 36, type: "small" },
];

// how far each finished building sticks up above its roof (for beams and labels)
export const EXTRA_TOP = { power: 16, water: 0, radio: 26, arcade: 12, hall: 44, small: 4 };

// ---------- future districts: drawn now so the scale of the plan is visible ----------
export const DISTRICTS = [
  {
    id: "food",
    color: "#fb923c",
    name: { af: "Eetplek", en: "Food Court" },
    blurb: {
      af: "Restaurante, wegneemetes, bakkerye, kafees en spyskaarte.",
      en: "Restaurants, takeaways, bakeries, cafes and menus.",
    },
    blocks: [[1, 11, 2, 2, 20], [3, 11, 1, 2, 30], [1, 13, 1, 2, 26], [2, 13, 2, 1, 16], [2, 14, 2, 1, 22]],
  },
  {
    id: "auto",
    color: "#a78bfa",
    name: { af: "Motordistrik", en: "Automotive District" },
    blurb: {
      af: "Werkswinkels, bandewinkels, onderdele en voertuigdienste.",
      en: "Mechanics, panel beaters, tyres, parts and vehicle services.",
    },
    blocks: [[6, 11, 3, 1, 18], [6, 12, 1, 2, 26], [8, 12, 1, 2, 22], [7, 13, 1, 1, 12], [6, 14, 3, 1, 20]],
  },
  {
    id: "retail",
    color: "#f472b6",
    name: { af: "Kleinhandelsdistrik", en: "Retail District" },
    blurb: {
      af: "Klere, algemene handelaars, elektronika en plaaslike winkels.",
      en: "Clothing, general dealers, electronics and local retailers.",
    },
    blocks: [[16, 6, 2, 2, 24], [18, 6, 1, 3, 32], [16, 8, 2, 1, 16], [17, 9, 2, 1, 20], [19, 6, 1, 1, 12]],
  },
  {
    id: "services",
    color: "#2dd4bf",
    name: { af: "Diensdistrik", en: "Services District" },
    blurb: {
      af: "Rekenmeesters, kontrakteurs, elektrisiëns, loodgieters en ander professionele mense.",
      en: "Accountants, contractors, electricians, plumbers and other professionals.",
    },
    blocks: [[11, 1, 2, 2, 34], [13, 1, 2, 1, 22], [13, 3, 1, 2, 28], [11, 3, 2, 1, 18], [12, 4, 2, 1, 14]],
  },
  {
    id: "homesA",
    color: "#60a5fa",
    name: { af: "Woongebied", en: "Residential" },
    blurb: {
      af: "Huise en huurplekke uit die Bulletin se behuisingslys.",
      en: "Homes and rentals from the Bulletin's housing listings.",
    },
    blocks: [[1, 6, 1, 1, 10], [3, 6, 1, 1, 14], [1, 8, 1, 1, 12], [3, 8, 1, 1, 10], [2, 7, 1, 1, 16]],
  },
  {
    id: "homesB",
    color: "#60a5fa",
    name: { af: "Woongebied", en: "Residential" },
    blurb: {
      af: "Huise en huurplekke uit die Bulletin se behuisingslys.",
      en: "Homes and rentals from the Bulletin's housing listings.",
    },
    blocks: [[16, 11, 1, 1, 12], [18, 11, 1, 1, 10], [16, 13, 1, 1, 14], [18, 13, 1, 1, 12], [17, 12, 1, 1, 18]],
  },
  {
    id: "windmill",
    color: "#22d3ee",
    name: { af: "Windpomp", en: "Windmill" },
    blurb: {
      af: "Brandfort se windpomp. 'n Landmerk van die dorp.",
      en: "Brandfort's windmill. A landmark of the town.",
    },
    blocks: [[7, 2, 1, 1, 78]],
  },
];

export const COLORS = {
  done: { line: "#22d3ee", light: "#a5f3fc" },
  building: { line: "#f87171", light: "#fecaca" },
  queued: { line: "#2563eb", light: "#93c5fd" },
};

export const QUICK = [10, 25, 50];

// ---------- project helpers ----------
// BB is stored in the town's "materials" column
export const needOf = (p) => p.needs_materials || 0;
export const haveOf = (p) => Math.min(p.have_materials || 0, needOf(p));
export const percentOf = (p) => {
  if (p.status === "done") return 1;
  const need = needOf(p);
  return need ? Math.min(1, haveOf(p) / need) : 0;
};
export const statusOf = (p) =>
  p.status === "done" ? "done" : percentOf(p) > 0 || p.status === "building" ? "building" : "queued";

export function boundsOf(district) {
  let x0 = 99, y0 = 99, x1 = 0, y1 = 0, hMax = 0;
  district.blocks.forEach(([gx, gy, w, d, h]) => {
    x0 = Math.min(x0, gx);
    y0 = Math.min(y0, gy);
    x1 = Math.max(x1, gx + w);
    y1 = Math.max(y1, gy + d);
    hMax = Math.max(hMax, h);
  });
  return { x0, y0, x1, y1, hMax };
}

// ---------- text ----------
export const TEXT = {
  af: {
    loading: "Laai die Grid...",
    failed: "Kon nie die Grid laai nie.",
    retry: "Probeer weer",
    conceptTag: "KONSEP",
    concept:
      "Konsepvoorskou. Brandfort Grid is 'n eksperimentele konsep, nie 'n klaar produk nie. Spandeer BB om die eerste landmerke te help bou.",
    level: "VL",
    townProgress: "Dorpvordering",
    myBB: "My BB",
    invested: "In die dorp",
    hunters: "Hunters",
    done: "Voltooi",
    building: "Word gebou",
    queued: "In die ry",
    soon: "Kom binnekort",
    funded: "Befonds",
    needed: "Nog nodig",
    spend: "Bou",
    buildBtn: "Bou met {n} BB",
    max: "Maks",
    balance: "Jou saldo",
    noBB: "Jy het nog geen BB nie. Voltooi missies om BB te verdien.",
    signIn: "Teken in om BB te spandeer.",
    becomeHunter: "Word 'n Hunter",
    spent: "Dankie! Jou BB is by die gebou gevoeg.",
    full: "Hierdie gebou is al ten volle befonds.",
    notEnough: "Jy het nie genoeg BB nie.",
    errorSpend: "Kon nie spandeer nie. Probeer weer.",
    done2: "Hierdie gebou is voltooi.",
    top: "Top bouers",
    founders: "Stigters",
    backers: "Ondersteuners tot dusver",
    founderNote:
      "Almal wat bydra voordat 'n gebou 100% bereik, word as stigters van daardie gebou aangeteken. Ons beplan om stigters in die volle Brandfort Grid te noem.",
    firstFounder: "Wees die eerste stigter!",
    zoomIn: "Zoem in",
    zoomOut: "Zoem uit",
    home: "Herstel aansig",
    close: "Maak toe",
    back: "Terug",
    soundOn: "Klank aan",
    soundOff: "Klank af",
    info: "Hoe dit werk",
    howTitle: "Hoe dit werk",
    how: [
      "Voltooi missies om Bulletin Bucks (BB) te verdien.",
      "Spandeer BB om geboue in die dorp te befonds.",
      "Ondersteun 'n gebou voor dit 100% bereik om as stigter aangeteken te word.",
    ],
    complete: "{name} is voltooi!",
    tapHint: "TIK",
  },
  en: {
    loading: "Loading the Grid...",
    failed: "Couldn't load the Grid.",
    retry: "Try again",
    conceptTag: "CONCEPT",
    concept:
      "Concept preview. Brandfort Grid is an experimental concept, not a finished product. Spend BB to help build the first landmarks.",
    level: "LV",
    townProgress: "Town progress",
    myBB: "My BB",
    invested: "In the town",
    hunters: "Hunters",
    done: "Built",
    building: "Under construction",
    queued: "Queued",
    soon: "Coming soon",
    funded: "Funded",
    needed: "Still needed",
    spend: "Build",
    buildBtn: "Build with {n} BB",
    max: "Max",
    balance: "Your balance",
    noBB: "You have no BB yet. Complete missions to earn some.",
    signIn: "Sign in to spend BB.",
    becomeHunter: "Become a Hunter",
    spent: "Thank you! Your BB has been added to the building.",
    full: "This building is already fully funded.",
    notEnough: "You don't have enough BB.",
    errorSpend: "Couldn't spend. Please try again.",
    done2: "This building is complete.",
    top: "Top builders",
    founders: "Founders",
    backers: "Backers so far",
    founderNote:
      "Everyone who contributes before a building reaches 100% is recorded as a founder of it. We plan to name founders in the full Brandfort Grid.",
    firstFounder: "Be the first founder!",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    home: "Reset view",
    close: "Close",
    back: "Back",
    soundOn: "Sound on",
    soundOff: "Sound off",
    info: "How it works",
    howTitle: "How it works",
    how: [
      "Complete missions to earn Bulletin Bucks (BB).",
      "Spend BB to fund buildings in the town.",
      "Back a building before it reaches 100% to be recorded as its founder.",
    ],
    complete: "{name} is complete!",
    tapHint: "TAP",
  },
};
