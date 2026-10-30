// src/lib/createFormsBusiness.js
import { extractYoutubeId } from "@/lib/youtube";
import { CATEGORIES } from "@/lib/categories";

const T = (af, en) => ({ af, en });

const UPDATE_CATS = [
  { value: "Special", icon: "🔥", af: "Spesiaal", en: "Special" },
  { value: "New Stock", icon: "📦", af: "Nuwe Voorraad", en: "New Stock" },
  { value: "Menu", icon: "🍽️", af: "Spyskaart", en: "Menu" },
  { value: "Offer", icon: "🏷️", af: "Aanbod", en: "Offer" },
  { value: "Announcement", icon: "📣", af: "Aankondiging", en: "Announcement" },
];

const BUSINESS_CATS = CATEGORIES.filter((c) => c.slug !== "all").map((c) => ({
  value: c.name,
  icon: c.icon,
  af: c.af,
  en: c.en,
}));

// Turn "Tyre fitting, engine repairs" into ["tyre fitting", "engine repairs"]
function parseServices(raw) {
  const seen = new Set();
  return (raw || "")
    .split(/[,\n]/)
    .map((s) => s.trim().toLowerCase().slice(0, 40))
    .filter((s) => {
      if (!s || seen.has(s)) return false;
      seen.add(s);
      return true;
    })
    .slice(0, 10);
}

const contactField = (name) => ({
  name,
  kind: "tel",
  required: true,
  max: 20,
  remember: "bulletin_whatsapp",
  placeholder: T("bv. 0821234567", "e.g. 0821234567"),
});

export const BUSINESS_FORMS = {
  update: {
    icon: "📢",
    table: "business_updates",
    bucket: "business_update_images",
    mine: null,
    live: false,
    seeHref: "/business",
    title: T("Plaas 'n opdatering", "Post an update"),
    intro: T(
      "Spesiale, nuwe voorraad of nuus. Ons keur dit gou goed.",
      "Specials, new stock or news. We approve it quickly."
    ),
    rules: T(
      "Net vir gelyste besighede. Maak seker jou besigheid is eers gelys en goedgekeur.",
      "For listed businesses only. Make sure your business is listed and approved first."
    ),
    fields: [
      {
        name: "business_id",
        kind: "business",
        required: true,
        label: T("Jou besigheid", "Your business"),
        hint: T("Sien jy dit nie? Lys eers jou besigheid.", "Can't see it? List your business first."),
      },
      { name: "category", kind: "chips", default: "Announcement", options: UPDATE_CATS, label: T("Wat soort opdatering?", "What kind of update?") },
      { name: "title", kind: "text", required: true, max: 80, label: T("Opskrif", "Headline"), placeholder: T("bv. Vrydag-spesiaal: 2 vir 1 pizzas", "e.g. Friday special: 2-for-1 pizzas") },
      { name: "body", kind: "textarea", max: 600, label: T("Besonderhede (opsioneel)", "Details (optional)") },
      { name: "photo", kind: "photo", label: T("Foto (opsioneel)", "Photo (optional)") },
      { name: "youtube", kind: "youtube", label: T("Video (opsioneel)", "Video (optional)") },
      {
        ...contactField("contact_number"),
        label: T("Jou kontaknommer", "Your contact number"),
        hint: T(
          "Vir verifikasie. Dit moet ooreenstem met jou besigheid se rekord.",
          "For verification. It should match your business's record."
        ),
      },
    ],
    validate: (v, lang) =>
      v.youtube?.trim() && !extractYoutubeId(v.youtube.trim())
        ? T("Kon nie 'n geldige YouTube skakel herken nie.", "Couldn't recognize a valid YouTube link.")[lang]
        : null,
    build: (v, { imageUrl }) => ({
      business_id: v.business_id,
      contact_number: v.contact_number.trim(),
      title: v.title.trim(),
      body: (v.body || "").trim(),
      category: v.category,
      image_url: imageUrl,
      youtube_id: v.youtube?.trim() ? extractYoutubeId(v.youtube.trim()) : null,
    }),
  },

  business: {
    icon: "🏪",
    table: "businesses",
    bucket: "business_logos",
    photoMode: "logo",
    mine: null,
    live: false,
    seeHref: "/business",
    title: T("Lys my besigheid", "List my business"),
    intro: T(
      "Gratis. Die hele dorp kan jou vind. Ons keur dit gou goed.",
      "Free. The whole town can find you. We approve it quickly."
    ),
    rules: T("", ""),
    fields: [
      { name: "name", kind: "text", required: true, max: 60, label: T("Besigheid naam", "Business name"), remember: null },
      { name: "category", kind: "select", required: true, options: BUSINESS_CATS, label: T("Soort besigheid", "Type of business") },
      { name: "description", kind: "textarea", required: true, max: 600, label: T("Wat doen julle?", "What do you do?"), placeholder: T("Vertel mense kortliks van jou besigheid", "Tell people briefly about your business") },
      {
        name: "services",
        kind: "text",
        max: 200,
        label: T("Dienste (opsioneel)", "Services (optional)"),
        placeholder: T("bv. Bande, enjin herstel", "e.g. Tyre fitting, engine repairs"),
        hint: T("Skei met kommas. Dit help mense jou vind.", "Separate with commas. This helps people find you."),
      },
      {
        ...contactField("contact"),
        label: T("Kontak nommer", "Contact number"),
        hint: T("Hierdie nommer sal op jou bladsy wys.", "This number will show on your page."),
      },
      { name: "address", kind: "text", max: 120, label: T("Adres (opsioneel)", "Address (optional)") },
      { name: "hours", kind: "text", max: 80, label: T("Ure (opsioneel)", "Hours (optional)"), placeholder: T("bv. Ma-Vr 8:00-17:00", "e.g. Mon-Fri 8am-5pm") },
      { name: "photo", kind: "photo", label: T("Logo (opsioneel)", "Logo (optional)") },
    ],
    build: (v, { imageUrl }) => {
      const services = parseServices(v.services);
      const row = {
        name: v.name.trim(),
        category: v.category,
        description: v.description.trim(),
        contact: v.contact.trim(),
        address: (v.address || "").trim(),
        hours: (v.hours || "").trim(),
        logo_url: imageUrl,
      };
      if (services.length > 0) row.services = services;
      return row;
    },
  },
};