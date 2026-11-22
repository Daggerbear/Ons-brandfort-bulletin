// src/lib/bot/botOwnerHelp.js
// Answers for business owners: how the accounts, dashboard and tools work.
// Written by hand (so it can never make things up) and checked against what the site really does.
import { scorePhrases } from "./botIntent";

const DASH = { href: "/my-business", af: "📊 Maak my dashboard oop", en: "📊 Open my dashboard" };

export const OWNER_TOPICS = [
  {
    id: "claim",
    phrases: [
      "claim my business", "claim business", "claim a business", "claim my listing", "how do i claim", "maak aanspraak",
      "aanspraak maak", "i own a business", "i own this business", "i have a business", "ek het n besigheid",
      "ek besit n besigheid", "ek is die eienaar", "i am the owner", "im the owner", "my eie besigheid",
      "business account", "besigheidsrekening", "manage my business", "bestuur my besigheid", "own a business",
    ],
    af: {
      text: "So kry jy jou besigheid se rekening:\n1. Teken in met Google (Profiel-oortjie).\n2. Maak jou besigheid oop in die besigheidslys.\n3. Blaai heel onder en tik 'Maak aanspraak'. Vul jou naam en WhatsApp-nommer in.\n4. Ons keur dit goed, dan sien jy 'My Besigheid' op jou profiel.\nNog nie op die Bulletin nie? Registreer eers jou besigheid.",
      links: [{ href: "/besighede", label: "🏪 Vind my besigheid" }, { href: "/profile", label: "🔐 Teken in" }, { href: "/list-your-business", label: "➕ Registreer my besigheid" }],
    },
    en: {
      text: "Here's how to get your business account:\n1. Sign in with Google (Profile tab).\n2. Open your business in the business list.\n3. Scroll to the bottom and tap 'Claim it'. Fill in your name and WhatsApp number.\n4. We approve it, and then you'll see 'My Business' on your profile.\nNot on the Bulletin yet? Register your business first.",
      links: [{ href: "/besighede", label: "🏪 Find my business" }, { href: "/profile", label: "🔐 Sign in" }, { href: "/list-your-business", label: "➕ Register my business" }],
    },
  },
  {
    id: "register",
    phrases: [
      "list my business", "register my business", "add my business", "get my business listed", "registreer my besigheid",
      "plaas my besigheid", "how do i get listed", "put my business on", "my besigheid registreer",
    ],
    af: {
      text: "Registreer jou besigheid gratis: vul die vorm in en ons keur dit goed. Daarna kan jy aanspraak maak en alles self bestuur.",
      links: [{ href: "/list-your-business", label: "➕ Registreer my besigheid" }],
    },
    en: {
      text: "Register your business for free: fill in the form and we'll approve it. After that you can claim it and manage everything yourself.",
      links: [{ href: "/list-your-business", label: "➕ Register my business" }],
    },
  },
  {
    id: "edit",
    phrases: [
      "change my hours", "edit my business", "update my business", "change my address", "change my description",
      "change my number", "update my details", "verander my ure", "verander my adres", "verander my besigheid",
      "wysig my besigheid", "opdateer my besigheid", "edit my profile", "update my profile", "opdateer my profiel",
      "change my opening hours", "add services", "voeg dienste by",
    ],
    af: {
      text: "Jy kan jou besigheid se inligting self verander, gratis:\n1. Maak jou dashboard oop (Profiel > My Besigheid).\n2. Tik die 'Profiel'-teël.\n3. Verander jou beskrywing, ure, adres, dienste en meer, en tik 'Stoor veranderinge'.\nDit werk nadat jou aanspraak goedgekeur is.",
      links: [DASH],
    },
    en: {
      text: "You can change your business info yourself, for free:\n1. Open your dashboard (Profile > My Business).\n2. Tap the 'Profile' tile.\n3. Change your description, hours, address, services and more, then tap 'Save changes'.\nThis works once your claim is approved.",
      links: [DASH],
    },
  },
  {
    id: "logo",
    phrases: ["logo", "change my logo", "upload logo", "my logo", "verander my logo", "laai logo op", "company logo", "new logo"],
    af: {
      text: "Jou logo verander jy so:\n1. Dashboard > 'Logo'-teël.\n2. Kies jou logo en tik 'Stoor logo'.\nGratis rekeninge kan hul logo een keer per maand verander. Betaalde rekeninge so dikwels as hulle wil.",
      links: [DASH],
    },
    en: {
      text: "Here's how to change your logo:\n1. Dashboard > 'Logo' tile.\n2. Choose your logo and tap 'Save logo'.\nFree accounts can change their logo once a month. Paid accounts as often as they like.",
      links: [DASH],
    },
  },
  {
    id: "style",
    phrases: [
      "page colours", "page colors", "change colours", "change colors", "change theme", "page theme", "page style",
      "page layout", "template", "kleure", "verander kleure", "bladsy kleure", "tema", "bladsystyl",
      "uitleg van my bladsy", "change the layout", "colour scheme", "color scheme", "kleurskema",
      "change the colours", "change the colors", "colours of my page", "colors of my page", "colours on my page",
      "my page colours", "my page layout", "verander die kleure", "kleure van my bladsy", "kleure op my bladsy",
    ],
    af: {
      text: "Bladsystyl is 'n betaalde gereedskap:\n1. Dashboard > 'Styl'-teël.\n2. Kies 'n uitleg en 'n kleurskema, kyk die voorskou en tik 'Stoor styl'.\nJy kan jou styl een keer per maand verander, so kies mooi. Gratis bladsye gebruik die Klassieke uitleg met oranje.",
      links: [DASH],
    },
    en: {
      text: "Page style is a paid tool:\n1. Dashboard > 'Style' tile.\n2. Pick a layout and a colour scheme, check the preview and tap 'Save style'.\nYou can change your style once a month, so choose well. Free pages use the Classic layout in orange.",
      links: [DASH],
    },
  },
  {
    id: "menu",
    phrases: [
      "add my menu", "my menu", "put my menu", "upload my menu", "stel my spyskaart op", "my spyskaart",
      "ordering system", "online ordering", "take orders", "bestelstelsel", "whatsapp orders", "how do i add menu",
      "add menu items", "change my prices", "update my prices", "verander my pryse", "sell food online",
    ],
    af: {
      text: "Spyskaart en bestellings is 'n betaalde gereedskap:\n1. Dashboard > 'Spyskaart'-teël.\n2. Voeg kategorieë en items by, en stel pryse en voorraad.\n3. Skakel die spyskaart aan onder Instellings. Kliënte bestel dan op WhatsApp.\nOnder Gereedskap kan jy 'n hele kategorie se pryse in een slag verander.",
      links: [DASH],
    },
    en: {
      text: "Menu and ordering is a paid tool:\n1. Dashboard > 'Menu' tile.\n2. Add categories and items, and set prices and stock.\n3. Switch the menu on under Settings. Customers then order on WhatsApp.\nUnder Tools you can change a whole category's prices in one go.",
      links: [DASH],
    },
  },
  {
    id: "delivery",
    phrases: ["delivery fee", "afleweringsfooi", "set delivery", "stel aflewering", "charge for delivery", "delivery cost", "aflewering koste"],
    af: {
      text: "Afleweringsfooi stel jy so:\n1. Dashboard > Spyskaart > Instellings.\n2. Skakel 'Aflewering beskikbaar' aan en tik jou fooi.\nDie fooi word outomaties by die totaal gevoeg in die kliënt se WhatsApp-bestelling.",
      links: [DASH],
    },
    en: {
      text: "Here's how to set a delivery fee:\n1. Dashboard > Menu > Settings.\n2. Switch on 'Delivery available' and type your fee.\nThe fee is added to the total automatically in the customer's WhatsApp order.",
      links: [DASH],
    },
  },
  {
    id: "qr",
    phrases: ["qr", "qr code", "qr kode", "qr poster", "poster", "plakkaat", "print my menu", "scan to order"],
    af: {
      text: "Die QR-kode is 'n betaalde gereedskap:\n1. Dashboard > 'QR-kode'-teël.\n2. Kies of dit na jou spyskaart of jou bladsy wys.\n3. Laai die prent af, of druk 'n plakkaat.\nSit dit op jou toonbank of venster. Jou dashboard tel hoeveel mense dit skandeer.",
      links: [DASH],
    },
    en: {
      text: "The QR code is a paid tool:\n1. Dashboard > 'QR code' tile.\n2. Choose whether it points to your menu or your page.\n3. Download the image, or print a poster.\nPut it on your counter or window. Your dashboard counts how many people scan it.",
      links: [DASH],
    },
  },
  {
    id: "posts",
    phrases: [
      "post an update", "post a special", "post a special offer", "how do i post", "plaas n opdatering", "plaas opdatering",
      "how do i advertise", "adverteer my besigheid", "how can i advertise", "post on the feed", "business feed",
      "how many posts", "hoeveel plasings",
    ],
    af: {
      text: "Plasings:\n1. Dashboard > 'Plasings'-teël.\n2. Kies 'n soort, skryf 'n opskrif en plaas.\nJy kry 3 gratis plasings per maand en dit wys dadelik op jou bladsy. Betaalde rekeninge kry onbeperkte plasings.",
      links: [DASH],
    },
    en: {
      text: "Posts:\n1. Dashboard > 'Posts' tile.\n2. Pick a type, write a headline and post.\nYou get 3 free posts a month and they show on your page straight away. Paid accounts get unlimited posts.",
      links: [DASH],
    },
  },
  {
    id: "stats",
    phrases: [
      "my stats", "statistics", "analytics", "how many views", "how many people viewed", "hoeveel mense", "my besoeke",
      "how many orders", "hoeveel bestellings", "who viewed my page", "page views",
    ],
    af: {
      text: "Jou dashboard wys besoeke, kontak-tikke, bestellings en QR-skanderings vir die afgelope 7 of 30 dae, met 'n grafiek en 'n lewendige aktiwiteitslys. Dit is gratis vir elke besigheid.",
      links: [DASH],
    },
    en: {
      text: "Your dashboard shows views, contact taps, orders and QR scans for the last 7 or 30 days, with a chart and a live activity list. It's free for every business.",
      links: [DASH],
    },
  },
  {
    id: "plans",
    phrases: [
      "how much does it cost", "what does it cost", "how much is it", "pricing", "paid tools", "paid package",
      "starter package", "starter pakket", "betaalde gereedskap", "hoeveel kos dit", "wat kos dit", "is it free",
      "is dit gratis", "what is free", "wat is gratis", "subscription", "upgrade my business", "upgrade my account",
      "how do i pay", "hoe betaal ek", "beginnerpakket",
    ],
    af: {
      text: "Die Bulletin is gratis om te gebruik. 😊\nGratis vir besighede: 'n bladsy in die besigheidslys, 'n profiel wat jy self opdateer, die dashboard met statistiek, 3 plasings per maand en een logo-verandering per maand.\nBetaalde pakket: spyskaart en bestellings (met afleweringsfooi), bladsystyl (ander uitlegte en kleure), QR-kode, en onbeperkte plasings en logo-veranderinge.\nKontak ons vir die prys.",
      links: [{ href: "/contact", label: "✉️ Kontak ons" }],
    },
    en: {
      text: "The Bulletin is free to use. 😊\nFree for businesses: a page in the business list, a profile you update yourself, the dashboard with statistics, 3 posts a month and one logo change a month.\nPaid package: menu and ordering (with a delivery fee), page style (other layouts and colours), QR code, and unlimited posts and logo changes.\nContact us for the price.",
      links: [{ href: "/contact", label: "✉️ Contact us" }],
    },
  },
  {
    id: "dashboard",
    phrases: ["dashboard", "my dashboard", "control panel", "beheer paneel", "beheerpaneel", "my business page", "my besigheid bladsy"],
    af: {
      text: "Jou dashboard het alles op een plek: besoeke, kontak-tikke, bestellings, 'n grafiek, jou gereedskap en lewendige aktiwiteit. Jy kry dit by Profiel > My Besigheid, nadat jou aanspraak goedgekeur is.",
      links: [DASH],
    },
    en: {
      text: "Your dashboard has everything in one place: views, contact taps, orders, a chart, your tools and live activity. You'll find it under Profile > My Business, once your claim is approved.",
      links: [DASH],
    },
  },
  {
    id: "featured",
    phrases: ["get featured", "featured business", "uitgelig", "word uitgelig", "homepage carousel", "sponsor", "sponsored", "advertise on the homepage"],
    af: {
      text: "Wil jy op die tuisblad uitgelig word? Dit is 'n betaalde plek. Kontak ons dan gesels ons oor die opsies.",
      links: [{ href: "/contact", label: "✉️ Kontak ons" }],
    },
    en: {
      text: "Want to be featured on the homepage? That's a paid spot. Contact us and we'll talk through the options.",
      links: [{ href: "/contact", label: "✉️ Contact us" }],
    },
  },
];

// Best matching topic, or null
export function matchOwnerTopic(toks) {
  let best = null;
  let bestScore = 0;
  for (const topic of OWNER_TOPICS) {
    const s = scorePhrases(toks, topic.phrases);
    if (s > bestScore) {
      best = topic;
      bestScore = s;
    }
  }
  return best;
}
