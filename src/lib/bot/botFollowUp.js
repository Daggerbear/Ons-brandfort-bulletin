// src/lib/bot/botFollowUp.js
// Answers about one or a few businesses: are they open, their number, where they are, their menu.
import { openStatus } from "./botHours";
import { DAYS, NEW_T } from "./botText";

function extractNumber(contact) {
  if (!contact) return null;
  const match = String(contact).match(/(?:\+?27|0)[\d\s()-]{8,}/);
  if (!match) return null;
  let digits = match[0].replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "27" + digits.slice(1);
  return digits.length >= 11 && digits.length <= 12 ? digits : null;
}

function when(next, lang) {
  const X = NEW_T[lang];
  if (next.dayOffset === 0) return X.today(next.time);
  if (next.dayOffset === 1) return X.tomorrow(next.time);
  return X.onDay(DAYS[lang][next.dow], next.time);
}

export function statusLine(b, lang, now) {
  const X = NEW_T[lang];
  const st = openStatus(b.hours, now);
  if (!st.known) return X.sUnknown(b.name, b.hours && String(b.hours).trim());
  if (st.always) return X.sAlways(b.name);
  if (st.open) return X.sOpen(b.name, st.closesAt);
  return st.next ? X.sClosed(b.name, when(st.next, lang)) : X.sClosedNone(b.name);
}

const pageLink = (b, lang) => ({ href: `/business/${b.id}`, label: NEW_T[lang].page });

// ask: "hours" | "phone" | "address" | "menu" | "more"
export function aboutBusinesses({ ask, targets, lang, now, menu }) {
  const X = NEW_T[lang];
  const list = targets.slice(0, 3);
  const links = [];
  const lines = [];

  for (const b of list) {
    if (ask === "hours") {
      lines.push(statusLine(b, lang, now));
    } else if (ask === "phone") {
      const digits = extractNumber(b.contact);
      if (b.contact && String(b.contact).trim()) {
        lines.push(X.phoneLine(b.name, String(b.contact).trim()));
        if (digits) {
          links.push({ href: `https://wa.me/${digits}`, label: list.length > 1 ? `${X.wa} ${b.name}` : X.wa });
          links.push({ href: `tel:+${digits}`, label: list.length > 1 ? `${X.call} ${b.name}` : X.call });
        }
      } else lines.push(X.phoneNone(b.name));
    } else if (ask === "address") {
      if (b.address && String(b.address).trim()) {
        lines.push(X.addressLine(b.name, String(b.address).trim()));
        links.push({
          href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.address}, Brandfort, South Africa`)}`,
          label: list.length > 1 ? `${X.maps} ${b.name}` : X.maps,
        });
      } else lines.push(X.addressNone(b.name));
    } else if (ask === "menu") {
      if (menu && menu[b.id] && menu[b.id] !== "enquiry") {
        lines.push(X.menuLine(b.name));
        links.push({ href: `/business/${b.id}/menu`, label: list.length > 1 ? `${X.viewMenu} ${b.name}` : X.viewMenu });
      } else lines.push(X.menuNone(b.name));
    } else {
      // more
      const desc = b.description ? String(b.description).trim().slice(0, 220) : "";
      const services = Array.isArray(b.services) && b.services.length ? `${X.moreServices}: ${b.services.slice(0, 6).join(", ")}` : "";
      lines.push([`🏪 ${b.name}`, desc, services].filter(Boolean).join("\n"));
    }
    if (list.length === 1 || ask === "more") links.push(pageLink(b, lang));
  }

  const suggest = [];
  if (ask !== "hours") suggest.push({ label: X.sgOpenNow, query: lang === "en" ? "are they open now" : "is hulle nou oop" });
  if (ask !== "phone") suggest.push({ label: X.sgNumber, query: lang === "en" ? "their number" : "hul nommer" });
  if (ask !== "address") suggest.push({ label: X.sgAddress, query: lang === "en" ? "where are they" : "waar is hulle" });

  return {
    text: lines.join("\n"),
    links: links.length ? links : undefined,
    results: list.length > 1 ? list : undefined,
    suggest: suggest.slice(0, 3),
    memory: { focus: list.map((b) => b.id) },
  };
}
