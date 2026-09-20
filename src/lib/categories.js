// src/lib/categories.js
// Single source of truth for business categories.
// `name` is the English value stored in the database; af/en are display labels.
export const CATEGORIES = [
  { name: "All", slug: "all", icon: "🏪", af: "Alle Besighede", en: "All Businesses" },
  { name: "Automotive & Mechanical", slug: "automotive-mechanical", icon: "🚗", af: "Motor & Meganies", en: "Automotive & Mechanical" },
  { name: "Home Services", slug: "home-services", icon: "🏠", af: "Huisdienste", en: "Home Services" },
  { name: "Professional Services", slug: "professional-services", icon: "💼", af: "Professionele Dienste", en: "Professional Services" },
  { name: "Food & Dining", slug: "food-dining", icon: "🍽️", af: "Kos & Eetplekke", en: "Food & Dining" },
  { name: "Kids & Education", slug: "kids-education", icon: "🧸", af: "Kinders & Onderwys", en: "Kids & Education" },
  { name: "Crafts & Gifts", slug: "crafts-gifts", icon: "🎁", af: "Kunsvlyt & Geskenke", en: "Crafts & Gifts" },
  { name: "Beauty & Spa", slug: "beauty-spa", icon: "💅", af: "Skoonheid & Spa", en: "Beauty & Spa" },
  { name: "Retail & Shopping", slug: "retail-shopping", icon: "🛍️", af: "Kleinhandel & Inkopies", en: "Retail & Shopping" },
  { name: "Agriculture", slug: "agriculture", icon: "🌾", af: "Landbou", en: "Agriculture" },
  { name: "Health & Medical", slug: "health-medical", icon: "🏥", af: "Gesondheid & Mediese", en: "Health & Medical" },
  { name: "Transport", slug: "transport", icon: "🚕", af: "Vervoer", en: "Transport" },
  { name: "Pets & Animals", slug: "pets-animals", icon: "🐾", af: "Troeteldiere & Diere", en: "Pets & Animals" },
  { name: "Other", slug: "other", icon: "📦", af: "Ander", en: "Other" },
];

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) || null;
}

export function getCategoryByName(name) {
  return CATEGORIES.find((c) => c.name === name) || null;
}