// src/lib/profileSkins.js
// Profile "skins". A skin is only a set of colour values. Every profile page reads these values
// through CSS variables (see ProfileShell), so a new skin never needs new page code.
//
// To add a skin later: copy "classic" below, give it a new id and change the values.
// To let people choose one: add a "skin" column to profiles, pass profile.skin to <ProfileShell skin={...}>.
// Nothing is selectable yet, so everyone gets DEFAULT_SKIN.

export const DEFAULT_SKIN = "classic";

export const SKINS = {
  // The Bulletin's own look: carbon black with orange
  classic: {
    name: { af: "Klassiek", en: "Classic" },
    vars: {
      "--pf-accent": "#f97316",
      "--pf-accent-text": "#fdba74", // accent as text on dark
      "--pf-on-accent": "#000000", // text on top of an accent button
      "--pf-card": "rgba(23, 23, 23, 0.86)",
      "--pf-line": "#262626",
      "--pf-line-strong": "#404040",
      "--pf-text": "#ffffff",
      "--pf-muted": "#a3a3a3",
      "--pf-faint": "#737373",
      "--pf-input": "#0a0a0a",
      "--pf-chip-bg": "rgba(249, 115, 22, 0.12)",
      "--pf-chip-line": "rgba(249, 115, 22, 0.35)",
      "--pf-glow": "rgba(249, 115, 22, 0.40)",
      "--pf-glow-soft": "rgba(249, 115, 22, 0.18)",
      "--pf-frame": "linear-gradient(135deg, #f97316, #fb923c 50%, #7c2d12)",
      "--pf-banner":
        "radial-gradient(120px 80px at 85% 20%, rgba(255,255,255,0.10), transparent 70%), linear-gradient(135deg, rgba(249,115,22,0.55), rgba(124,45,18,0.45) 55%, rgba(10,10,10,0.2))",
      "--pf-radius": "20px",
    },
  },

  // Example of a second skin (not selectable yet): the cyan "Hunter" look
  tron: {
    name: { af: "Tron", en: "Tron" },
    vars: {
      "--pf-accent": "#22d3ee",
      "--pf-accent-text": "#67e8f9",
      "--pf-on-accent": "#001018",
      "--pf-card": "rgba(5, 11, 24, 0.9)",
      "--pf-line": "rgba(34, 211, 238, 0.22)",
      "--pf-line-strong": "rgba(34, 211, 238, 0.4)",
      "--pf-text": "#ffffff",
      "--pf-muted": "#94a3b8",
      "--pf-faint": "#64748b",
      "--pf-input": "#02060f",
      "--pf-chip-bg": "rgba(34, 211, 238, 0.12)",
      "--pf-chip-line": "rgba(34, 211, 238, 0.4)",
      "--pf-glow": "rgba(34, 211, 238, 0.45)",
      "--pf-glow-soft": "rgba(34, 211, 238, 0.18)",
      "--pf-frame": "linear-gradient(135deg, #22d3ee, #3b82f6 60%, #1e1b4b)",
      "--pf-banner":
        "linear-gradient(135deg, rgba(34,211,238,0.45), rgba(37,99,235,0.4) 55%, rgba(2,6,15,0.3))",
      "--pf-radius": "20px",
    },
  },
};

export const safeSkin = (id) => (SKINS[id] ? id : DEFAULT_SKIN);

// The CSS variables of one skin, ready to use as a style={...} prop
export const skinVars = (id) => SKINS[safeSkin(id)].vars;
