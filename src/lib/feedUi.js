// src/lib/feedUi.js
export const categories = [
  { value: "all", af: "Alles", en: "All" },
  { value: "question", af: "Vra", en: "Question" },
  { value: "lost", af: "Verlore", en: "Lost" },
  { value: "found", af: "Gevind", en: "Found" },
  { value: "announcement", af: "Aankondiging", en: "Announcement" },
  { value: "birthday", af: "Verjaarsdag", en: "Birthday" },
  { value: "thank_you", af: "Dankie", en: "Thank You" },
  { value: "recommendation", af: "Aanbeveling", en: "Recommendation" },
  { value: "warning", af: "Waarskuwing", en: "Warning" },
  { value: "community", af: "Gemeenskap", en: "Community" },
];

// Each category gets its own identity: text/dot colour plus a coloured left edge on the card
export const CATEGORY_STYLES = {
  question: { text: "text-sky-400", dot: "bg-sky-400", border: "border-l-sky-400" },
  lost: { text: "text-red-400", dot: "bg-red-400", border: "border-l-red-400" },
  found: { text: "text-emerald-400", dot: "bg-emerald-400", border: "border-l-emerald-400" },
  announcement: { text: "text-orange-400", dot: "bg-orange-400", border: "border-l-orange-400" },
  birthday: { text: "text-pink-400", dot: "bg-pink-400", border: "border-l-pink-400" },
  thank_you: { text: "text-purple-400", dot: "bg-purple-400", border: "border-l-purple-400" },
  recommendation: { text: "text-teal-400", dot: "bg-teal-400", border: "border-l-teal-400" },
  warning: { text: "text-amber-400", dot: "bg-amber-400", border: "border-l-amber-400" },
  community: { text: "text-green-400", dot: "bg-green-400", border: "border-l-green-400" },
};

const AVATAR_COLORS = [
  "bg-orange-500", "bg-sky-500", "bg-emerald-500", "bg-pink-500",
  "bg-purple-500", "bg-amber-500", "bg-teal-500", "bg-red-500",
];

// Same person always gets the same colour
export function avatarColor(name = "") {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function timeAgo(dateStr, lang) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  const units = [
    { s: 31536000, af: "j", en: "y" },
    { s: 2592000, af: "m", en: "mo" },
    { s: 86400, af: "d", en: "d" },
    { s: 3600, af: "u", en: "h" },
    { s: 60, af: "min", en: "m" },
  ];
  for (const u of units) {
    const val = Math.floor(seconds / u.s);
    if (val >= 1) return `${val}${lang === "af" ? u.af : u.en}`;
  }
  return lang === "af" ? "nou" : "now";
}