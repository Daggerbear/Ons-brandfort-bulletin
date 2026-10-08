// src/components/helper/helperData.js
// Routes, texts and small helpers used by the floating helper.
import { supabase } from "@/lib/supabase";
import { extractKeywords } from "@/lib/businessSearch";

// Where things live on the site. Change here if a route is different.
export const businessHref = (id) => `/business/${id}`;
export const menuHref = (id) => `/business/${id}/menu`;
export const eventHref = (id) => `/events/${id}`;

export const money = (amount) => `R${Number(amount || 0).toFixed(2)}`;

// South African mobile number -> WhatsApp format (27...). Returns null for landlines.
export function whatsappNumber(contact) {
  let d = (contact || "").replace(/[^\d]/g, "");
  if (d.startsWith("27") && d.length === 11) d = "0" + d.slice(2);
  if (/^0(6\d|7[1-9]|8[1-5])\d{7}$/.test(d)) return "27" + d.slice(1);
  return null;
}

export const QUICK_TAGS = [
  { af: "Ek soek werk", en: "I'm looking for a job" },
  { af: "Ek wil iets verkoop", en: "I want to sell something" },
  { af: "Wat gebeur in die dorp?", en: "What's happening in town?" },
  { af: "Loodgieter", en: "Plumber" },
  { af: "Eetplek", en: "Restaurant" },
];

export const TEXT = {
  af: {
    subtitle: "Jou gids deur die Bulletin",
    intro:
      "Ek is hier om jou te help om jou pad te vind op die Bulletin. Ek leer altyd by wat mense soek, en as ek nie kan help nie, laat weet ek die span.",
    placeholder: "Vra my enigiets…",
    send: "Stuur",
    tryTags: "Probeer:",
    hint: "Hulp nodig? 👋",
    open: "Maak die hulp-gesels oop",
    close: "Maak toe",
    privacy: "Ek skryf net jou vraag neer, nie wie jy is nie.",
    helpful: "Was dit nuttig?",
    thanks: "Dankie! 🧡",
    reported: "Dankie, ek het dit vir die span gestuur.",
    switchTo: "English",
    menuBtn: "🍽️ Kyk menu",
    servicesBtn: "🧾 Kyk dienste",
    callBtn: "📞 Bel",
    waBtn: "💬 WhatsApp",
    waGreet: (name) => `Hi ${name}, ek het julle op die Bulletin gesien.`,
    onMenus: "Gevind op spyskaarte:",
    foundOnMenu: "Ek het dit op 'n spyskaart gevind:",
  },
  en: {
    subtitle: "Your guide to the Bulletin",
    intro:
      "I'm here to help you find your way around the Bulletin. I'm always learning what people look for, and if I can't help, I'll let the team know.",
    placeholder: "Ask me anything…",
    send: "Send",
    tryTags: "Try:",
    hint: "Need a hand? 👋",
    open: "Open the help chat",
    close: "Close",
    privacy: "I only save your question, not who you are.",
    helpful: "Was that helpful?",
    thanks: "Thank you! 🧡",
    reported: "Thanks, I've sent that to the team.",
    switchTo: "Afrikaans",
    menuBtn: "🍽️ View menu",
    servicesBtn: "🧾 View services",
    callBtn: "📞 Call",
    waBtn: "💬 WhatsApp",
    waGreet: (name) => `Hi ${name}, I found you on the Bulletin.`,
    onMenus: "Found on menus:",
    foundOnMenu: "I found this on a menu:",
  },
};

// Look for dishes / services by name on the menus (small, on-demand query)
export async function findMenuItems(query, businesses) {
  try {
    const words = extractKeywords(query)
      .map((w) => w.replace(/[%,_]/g, ""))
      .filter((w) => w.length >= 3)
      .slice(0, 2);
    if (words.length === 0) return [];

    const byId = new Map(businesses.map((b) => [b.id, b]));
    const batches = await Promise.all(
      words.map((w) =>
        supabase
          .from("menu_items")
          .select("id, business_id, name, price")
          .eq("is_available", true)
          .ilike("name", `%${w}%`)
          .limit(8)
      )
    );

    const seen = new Set();
    const hits = [];
    for (const res of batches) {
      for (const row of res.data || []) {
        const biz = byId.get(row.business_id);
        if (!biz || seen.has(row.id)) continue; // only approved businesses
        seen.add(row.id);
        hits.push({ ...row, businessName: biz.name });
      }
    }
    return hits.slice(0, 6);
  } catch {
    return [];
  }
}
