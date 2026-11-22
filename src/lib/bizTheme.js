// src/lib/bizTheme.js
// Page layouts (templates) and colour schemes for business pages.

export const DEFAULT_TEMPLATE = "classic";
export const DEFAULT_SCHEME = "orange";

// Each colour scheme is 3 colours: dark (background), light (text) and an accent.
// "orange" is the free default; the other seven are the paid choices.
export const SCHEMES = {
  orange: { dark: "#0a0a0a", light: "#f5f5f5", accent: "#ff6a00", name: { af: "Oranje", en: "Orange" } },
  aurora: { dark: "#000815", light: "#ffffff", accent: "#3be872", name: { af: "Aurora", en: "Aurora" } },
  gig: { dark: "#121212", light: "#caee34", accent: "#fc318b", name: { af: "Konsert", en: "Gig" } },
  gold: { dark: "#5b3d1b", light: "#f1d6a1", accent: "#ffc13a", name: { af: "Goud", en: "Gold" } },
  alpine: { dark: "#552b2d", light: "#ecd2c1", accent: "#ef7c89", name: { af: "Alpe", en: "Alpine" } },
  dawn: { dark: "#3a1a27", light: "#e9c2c3", accent: "#f7c27e", name: { af: "Dagbreek", en: "Dawn Rose" } },
  lime: { dark: "#183f46", light: "#e9efbf", accent: "#d8f336", name: { af: "Petrol-lime", en: "Petrol Lime" } },
  butter: { dark: "#651224", light: "#f6f1d3", accent: "#fac102", name: { af: "Botter", en: "Butter" } },
};

// Classic is free. The other three are part of the paid tools.
export const TEMPLATES = {
  classic: {
    free: true,
    name: { af: "Klassiek", en: "Classic" },
    desc: {
      af: "Die standaard uitleg met al jou inligting.",
      en: "The standard layout with all your info.",
    },
  },
  menu: {
    free: false,
    name: { af: "Spyskaart eerste", en: "Menu first" },
    desc: {
      af: "Spyskaart en bestel-knoppie bo-aan. Goed vir kos en afhaal.",
      en: "Menu and order button on top. Great for food and takeaways.",
    },
  },
  showcase: {
    free: false,
    name: { af: "Uitstalling", en: "Showcase" },
    desc: {
      af: "Groot kop met dienste in kaarte. Goed om te wys wat jy doen.",
      en: "Big header with services as cards. Great for showing what you do.",
    },
  },
  contact: {
    free: false,
    name: { af: "Kontak eerste", en: "Contact first" },
    desc: {
      af: "WhatsApp, bel en rigtings eerste. Goed vir dienste en werkers.",
      en: "WhatsApp, call and directions first. Great for trades and services.",
    },
  },
};

export const templateKeys = Object.keys(TEMPLATES);
export const schemeKeys = Object.keys(SCHEMES);

export const safeTemplate = (k) => (TEMPLATES[k] ? k : DEFAULT_TEMPLATE);
export const safeScheme = (k) => (SCHEMES[k] ? k : DEFAULT_SCHEME);

// ---- colour maths (so the page needs no browser colour-mix support) -------
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function rgbToHex(rgb) {
  return (
    "#" +
    rgb
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}
export function mix(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Small grey-ish labels: as soft as possible while staying readable on the cards.
function mutedColour(s) {
  const surface = mix(s.dark, s.light, 0.13);
  for (const t of [0.42, 0.34, 0.26, 0.18, 0.1, 0]) {
    const c = mix(s.light, s.dark, t);
    if (contrast(c, surface) >= 4.5) return c;
  }
  return s.light;
}

// The CSS variables a business page is painted with.
export function themeStyle(schemeKey) {
  const s = SCHEMES[safeScheme(schemeKey)];
  const whiteContrast = 1.05 / (luminance(s.accent) + 0.05);
  return {
    "--bz-bg": s.dark,
    "--bz-text": s.light,
    "--bz-muted": mutedColour(s),
    "--bz-surface": mix(s.dark, s.light, 0.07),
    "--bz-surface2": mix(s.dark, s.light, 0.13),
    "--bz-border": mix(s.dark, s.light, 0.17),
    "--bz-accent": s.accent,
    "--bz-accent-text": mix(s.accent, s.light, 0.18),
    "--bz-accent-soft": mix(s.dark, s.accent, 0.16),
    "--bz-accent-line": mix(s.dark, s.accent, 0.45),
    "--bz-hero-from": mix(s.dark, s.accent, 0.38),
    "--bz-on-accent": whiteContrast >= 2.8 ? "#ffffff" : "#0a0a0a",
  };
}
