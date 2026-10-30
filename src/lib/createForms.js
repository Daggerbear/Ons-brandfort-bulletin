// src/lib/createForms.js
import { extractYoutubeId } from "@/lib/youtube";

const T = (af, en) => ({ af, en });

const SHARE_CATS = [
  { value: "question", icon: "❓", af: "Vra iets", en: "Ask something" },
  { value: "announcement", icon: "📣", af: "Nuus", en: "News" },
  { value: "lost", icon: "🔍", af: "Verloor", en: "Lost" },
  { value: "found", icon: "🙌", af: "Gevind", en: "Found" },
  { value: "thank_you", icon: "💜", af: "Dankie", en: "Thank you" },
  { value: "recommendation", icon: "👍", af: "Aanbeveling", en: "Recommendation" },
  { value: "warning", icon: "⚠️", af: "Waarskuwing", en: "Warning" },
  { value: "birthday", icon: "🎂", af: "Verjaarsdag", en: "Birthday" },
  { value: "community", icon: "🏘️", af: "Gemeenskap", en: "Community" },
];

const SELL_CATS = [
  { value: "Other", icon: "📦", af: "Ander", en: "Other" },
  { value: "Vehicles", icon: "🚗", af: "Voertuie", en: "Vehicles" },
  { value: "Furniture", icon: "🛋️", af: "Meubels", en: "Furniture" },
  { value: "Electronics", icon: "📱", af: "Elektronika", en: "Electronics" },
  { value: "Clothing", icon: "👕", af: "Klere", en: "Clothing" },
  { value: "Household", icon: "🏠", af: "Huishoudelik", en: "Household" },
  { value: "Tools", icon: "🔧", af: "Gereedskap", en: "Tools" },
  { value: "Livestock", icon: "🐄", af: "Vee", en: "Livestock" },
];

const LISTING_TYPES = [
  { value: "rent", icon: "🔑", af: "Te huur", en: "To rent" },
  { value: "sale", icon: "🏷️", af: "Te koop", en: "For sale" },
];

const PROPERTY_TYPES = [
  { value: "House", icon: "🏠", af: "Huis", en: "House" },
  { value: "Flat", icon: "🏢", af: "Woonstel", en: "Flat" },
  { value: "Room", icon: "🛏️", af: "Kamer", en: "Room" },
  { value: "Granny flat", icon: "🏡", af: "Buitekamer", en: "Granny flat" },
  { value: "Plot", icon: "🌾", af: "Erf / Plot", en: "Plot / Land" },
  { value: "Commercial", icon: "🏪", af: "Kommersieel", en: "Commercial" },
  { value: "Other", icon: "📦", af: "Ander", en: "Other" },
];

const JOB_TYPES = [
  { value: "job", icon: "💼", af: "Ek soek werkers", en: "I'm hiring" },
  { value: "seeker", icon: "🙋", af: "Ek soek werk", en: "I'm looking for work" },
];

const JOB_CATS = [
  { value: "Other", af: "Ander", en: "Other" },
  { value: "Domestic Work", af: "Huiswerk", en: "Domestic Work" },
  { value: "Farm Work", af: "Plaaswerk", en: "Farm Work" },
  { value: "Retail", af: "Kleinhandel", en: "Retail" },
  { value: "Trades", af: "Ambagte", en: "Trades" },
  { value: "Admin/Office", af: "Admin/Kantoor", en: "Admin/Office" },
  { value: "Hospitality", af: "Gasvryheid", en: "Hospitality" },
  { value: "Driving", af: "Bestuur", en: "Driving" },
  { value: "Security", af: "Sekuriteit", en: "Security" },
];

const nameField = {
  name: "name",
  kind: "text",
  required: true,
  max: 40,
  label: T("Jou naam", "Your name"),
  hint: T("Gebruik jou regte naam.", "Please use your real name."),
};

const whatsappField = {
  name: "whatsapp",
  kind: "tel",
  required: true,
  max: 20,
  label: T("Jou WhatsApp nommer", "Your WhatsApp number"),
  placeholder: T("bv. 0821234567", "e.g. 0821234567"),
  hint: T(
    "Mense kontak jou hier. Ons onthou dit net op hierdie foon.",
    "People contact you here. We only remember it on this phone."
  ),
};

const short = (s, n = 120) => (s.length > n ? s.slice(0, n) + "…" : s);

export const FORMS = {
  share: {
    icon: "💬",
    table: "posts",
    bucket: "posts",
    mine: null,
    live: true,
    seeHref: "/",
    title: T("Deel iets met Brandfort", "Share with Brandfort"),
    intro: T("Vra iets, deel nuus, of sê dankie.", "Ask something, share news, or say thanks."),
    rules: T(
      "Nie vir besigheidsadvertensies nie. Wees vriendelik en gebruik jou regte naam.",
      "Not for business adverts. Be kind and use your real name."
    ),
    fields: [
      { name: "category", kind: "chips", default: "question", options: SHARE_CATS, label: T("Waaroor gaan dit?", "What is it about?") },
      { name: "content", kind: "textarea", required: true, max: 600, label: T("Skryf hier", "Write here"), placeholder: T("Wat wil jy sê?", "What do you want to say?") },
      { name: "photo", kind: "photo", label: T("Foto (opsioneel)", "Photo (optional)") },
      { name: "youtube", kind: "youtube", label: T("Video (opsioneel)", "Video (optional)") },
      nameField,
    ],
    validate: (v, lang) =>
      v.youtube?.trim() && !extractYoutubeId(v.youtube.trim())
        ? T("Kon nie 'n geldige YouTube skakel herken nie.", "Couldn't recognize a valid YouTube link.")[lang]
        : null,
    build: (v, { imageUrl }) => ({
      name: v.name.trim(),
      category: v.category,
      content: v.content.trim(),
      image_url: imageUrl,
      youtube_id: v.youtube?.trim() ? extractYoutubeId(v.youtube.trim()) : null,
    }),
    shareText: (v) => `${v.name.trim()}: ${short(v.content.trim())}`,
  },

  sell: {
    icon: "🛒",
    table: "classifieds",
    bucket: "classifieds",
    mine: "myClassifieds",
    live: true,
    seeHref: "/?filter=classified",
    title: T("Verkoop iets", "Sell something"),
    intro: T("Foto, prys, klaar. Kopers kontak jou op WhatsApp.", "Photo, price, done. Buyers contact you on WhatsApp."),
    rules: T(
      "Alles gebeur direk tussen jou en die koper. Ons is nie deel van enige transaksie nie.",
      "Everything happens directly between you and the buyer. We are not part of any transaction."
    ),
    fields: [
      { name: "photo", kind: "photo", label: T("Foto", "Photo") },
      { name: "title", kind: "text", required: true, max: 80, label: T("Wat verkoop jy?", "What are you selling?"), placeholder: T("bv. Tweedehandse yskas", "e.g. Second-hand fridge") },
      { name: "price", kind: "price", label: T("Prys", "Price") },
      { name: "category", kind: "chips", default: "Other", options: SELL_CATS, label: T("Soort", "Type") },
      { name: "description", kind: "textarea", required: true, max: 600, label: T("Meer inligting", "More details"), placeholder: T("Toestand, grootte, ens.", "Condition, size, etc.") },
      whatsappField,
      nameField,
    ],
    build: (v, { imageUrl }) => ({
      name: v.name.trim(),
      whatsapp: v.whatsapp.trim(),
      title: v.title.trim(),
      description: v.description.trim(),
      price: v.priceOnRequest ? null : v.price ? parseFloat(v.price) : null,
      price_on_request: !!v.priceOnRequest,
      category: v.category,
      image_url: imageUrl,
    }),
    shareText: (v) => `🛒 ${v.title.trim()}`,
  },

  housing: {
    icon: "🏠",
    table: "housing",
    bucket: "housing",
    mine: "myHousing",
    live: true,
    seeHref: "/?filter=housing",
    title: T("Huis of kamer", "House or room"),
    intro: T("Te huur of te koop. Mense kontak jou op WhatsApp.", "To rent or for sale. People contact you on WhatsApp."),
    rules: T(
      "Moenie deposito's vra voor mense die eiendom gesien het nie.",
      "Never ask for deposits before people have seen the property."
    ),
    fields: [
      { name: "listing_type", kind: "chips", default: "rent", options: LISTING_TYPES, label: T("Te huur of te koop?", "To rent or for sale?") },
      { name: "property_type", kind: "chips", default: "House", options: PROPERTY_TYPES, label: T("Wat is dit?", "What is it?") },
      { name: "photo", kind: "photo", label: T("Foto", "Photo") },
      { name: "title", kind: "text", required: true, max: 80, label: T("Opskrif", "Headline"), placeholder: T("bv. 2 slaapkamer huis te huur", "e.g. 2 bedroom house to rent") },
      { name: "area", kind: "text", max: 60, label: T("Waar? (opsioneel)", "Where? (optional)"), placeholder: T("bv. Brandfort Noord", "e.g. Brandfort North") },
      { name: "bedrooms", kind: "number", half: true, max: 2, label: T("Slaapkamers", "Bedrooms") },
      { name: "bathrooms", kind: "number", half: true, max: 2, label: T("Badkamers", "Bathrooms") },
      { name: "price", kind: "price", label: T("Prys", "Price") },
      { name: "description", kind: "textarea", required: true, max: 600, label: T("Meer inligting", "More details"), placeholder: T("Grootte, dieretoegang, beskikbaar vanaf...", "Size, pets allowed, available from...") },
      whatsappField,
      nameField,
    ],
    build: (v, { imageUrl }) => ({
      name: v.name.trim(),
      whatsapp: v.whatsapp.trim(),
      title: v.title.trim(),
      description: v.description.trim(),
      listing_type: v.listing_type,
      property_type: v.property_type,
      area: v.area?.trim() || null,
      bedrooms: v.bedrooms === "" || v.bedrooms == null ? null : parseInt(v.bedrooms, 10),
      bathrooms: v.bathrooms === "" || v.bathrooms == null ? null : parseInt(v.bathrooms, 10),
      price: v.priceOnRequest ? null : v.price ? parseFloat(v.price) : null,
      price_on_request: !!v.priceOnRequest,
      image_url: imageUrl,
    }),
    shareText: (v) => `🏠 ${v.title.trim()}`,
  },

  job: {
    icon: "💼",
    table: "jobs",
    bucket: null,
    mine: "myJobListings",
    live: true,
    seeHref: (v) => (v.type === "seeker" ? "/?filter=job" : "/business?filter=job"),
    title: T("Werk", "Work"),
    intro: T("Soek werkers, of vertel Brandfort jy soek werk.", "Find workers, or tell Brandfort you're looking for work."),
    rules: T(
      "Moenie vir 'n werk betaal nie. Wees eerlik oor die werk en die betaling.",
      "Never pay for a job. Be honest about the work and the pay."
    ),
    fields: [
      { name: "type", kind: "chips", default: "job", options: JOB_TYPES, label: T("Wat wil jy doen?", "What do you want to do?") },
      { name: "category", kind: "chips", default: "Other", options: JOB_CATS, label: T("Soort werk", "Type of work") },
      {
        name: "title",
        kind: "text",
        required: true,
        max: 80,
        label: (v) => (v.type === "seeker" ? T("Watter werk soek jy?", "What work are you looking for?") : T("Watter werk is beskikbaar?", "What work is available?")),
        placeholder: (v) => (v.type === "seeker" ? T("bv. Tuinwerk of skoonmaak", "e.g. Gardening or cleaning") : T("bv. Winkelassistent gesoek", "e.g. Shop assistant wanted")),
      },
      {
        name: "description",
        kind: "textarea",
        required: true,
        max: 600,
        label: T("Meer inligting", "More details"),
        placeholder: (v) => (v.type === "seeker" ? T("Jou ondervinding en wanneer jy kan begin", "Your experience and when you can start") : T("Wat die werk is, ure, betaling", "What the work is, hours, pay")),
      },
      whatsappField,
      nameField,
    ],
    build: (v) => ({
      name: v.name.trim(),
      whatsapp: v.whatsapp.trim(),
      type: v.type,
      title: v.title.trim(),
      description: v.description.trim(),
      category: v.category,
    }),
    shareText: (v) => `💼 ${v.title.trim()}`,
  },

  event: {
    icon: "📅",
    table: "events",
    bucket: "events-photos",
    mine: null,
    live: false,
    seeHref: "/",
    title: T("Vertel die dorp", "Tell the town"),
    intro: T("Gratis. Ons keur dit gou goed en dan sien almal dit.", "Free. We approve it quickly and then everyone sees it."),
    rules: T("", ""),
    fields: [
      { name: "title", kind: "text", required: true, max: 80, label: T("Wat gebeur?", "What's happening?"), placeholder: T("bv. Boeremark by die kerk", "e.g. Farmers market at the church") },
      { name: "date", kind: "date", required: true, label: T("Datum", "Date") },
      { name: "time", kind: "time", label: T("Tyd (opsioneel)", "Time (optional)") },
      { name: "location", kind: "text", required: true, max: 80, label: T("Waar?", "Where?"), placeholder: T("bv. Dorpsaal", "e.g. Town hall") },
      { name: "photo", kind: "photo", label: T("Foto (opsioneel)", "Photo (optional)") },
      { name: "description", kind: "textarea", max: 600, label: T("Meer inligting (opsioneel)", "More details (optional)") },
      whatsappField,
      nameField,
    ],
    build: (v, { imageUrl }) => ({
      title: v.title.trim(),
      date: v.date,
      time: v.time || "",
      location: v.location.trim(),
      description: (v.description || "").trim(),
      submittedBy: v.name.trim(),
      whatsapp: v.whatsapp.trim(),
      image_url: imageUrl,
    }),
    shareText: (v) => `📅 ${v.title.trim()}`,
  },
};