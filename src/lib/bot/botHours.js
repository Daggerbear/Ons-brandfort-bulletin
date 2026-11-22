// src/lib/bot/botHours.js
// Reads the opening hours a business typed ("Ma–Vr 08:00–17:00, Sa 08:00–13:00")
// and works out whether they are open right now. If the text is not understood
// it says so honestly instead of guessing.

const DAY_NAMES = {
  mon: 1, monday: 1, ma: 1, maandag: 1,
  tue: 2, tues: 2, tuesday: 2, di: 2, dinsdag: 2,
  wed: 3, wednesday: 3, wo: 3, woensdag: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4, do: 4, donderdag: 4,
  fri: 5, friday: 5, vr: 5, vrydag: 5,
  sat: 6, saturday: 6, sa: 6, saterdag: 6, saterdae: 6, saturdays: 6,
  sun: 0, sunday: 0, so: 0, sondag: 0, sondae: 0, sundays: 0,
};
Object.assign(DAY_NAMES, { mondays: 1, tuesdays: 2, wednesdays: 3, thursdays: 4, fridays: 5 });
const DAY = "(?:mondays|monday|mon|tuesdays|tuesday|tues|tue|wednesdays|wednesday|wed|thursdays|thursday|thurs|thur|thu|fridays|friday|fri|saturdays|saturday|sat|sundays|sunday|sun|maandag|ma|dinsdag|di|woensdag|wo|donderdag|do|vrydag|vr|saterdag|saterdae|sa|sondag|sondae|so)";
const SEP = "(?:-|to|tot|until|till)";

const EVERY_DAY = /\b(elke dag|every day|everyday|daily|daagliks|7 dae|7 days|7 dae 'n week)\b/;
const WEEKDAYS = /\b(weekdays|weekdae|werkdae|week days)\b/;
const WEEKEND = /\b(weekend|naweek|naweke)\b/;
const ALWAYS = /(\b24\s*(?:uur|hours?|hrs|h)\b|24\/7|\boop 24\b|\bopen 24\b)/;
const CLOSED = /\b(closed|gesluit|toe)\b/;

function clean(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[–—−]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/(\d)\s*h\s*(\d{2})/g, "$1:$2") // 8h30 -> 8:30
    .replace(/(\d)h\b/g, "$1:00") // 8h -> 8:00
    .replace(/(\d)\.(\d{2})\b/g, "$1:$2") // 8.30 -> 8:30
    .replace(/\s+/g, " ")
    .trim();
}

function daysInRange(a, b) {
  const out = [];
  let d = a;
  for (let i = 0; i < 7; i++) {
    out.push(d);
    if (d === b) break;
    d = (d + 1) % 7;
  }
  return out;
}

function daysFromClause(c) {
  const set = new Set();
  if (EVERY_DAY.test(c)) return [0, 1, 2, 3, 4, 5, 6];
  if (WEEKDAYS.test(c)) [1, 2, 3, 4, 5].forEach((d) => set.add(d));
  if (WEEKEND.test(c)) [6, 0].forEach((d) => set.add(d));
  const range = new RegExp(`\\b(${DAY})-(${DAY})\\b`, "g");
  let m;
  let rest = c;
  while ((m = range.exec(c))) {
    daysInRange(DAY_NAMES[m[1]], DAY_NAMES[m[2]]).forEach((d) => set.add(d));
    rest = rest.replace(m[0], " ");
  }
  const single = new RegExp(`\\b(${DAY})\\b`, "g");
  while ((m = single.exec(rest))) set.add(DAY_NAMES[m[1]]);
  return [...set];
}

function toMinutes(h, m, ap) {
  let hour = Number(h);
  const min = Number(m || 0);
  if (ap === "pm" && hour < 12) hour += 12;
  if (ap === "am" && hour === 12) hour = 0;
  return hour * 60 + min;
}

function rangesFromClause(c) {
  const re = new RegExp(`(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?\\s*${SEP}\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)?`, "g");
  const out = [];
  let m;
  while ((m = re.exec(c))) {
    const open = toMinutes(m[1], m[2], m[3]);
    let close = toMinutes(m[4], m[5], m[6]);
    if (close <= open) {
      // "8-5" means 8 to 17:00; "22:00-02:00" runs past midnight
      if (!m[6] && close <= 12 * 60 && close + 12 * 60 > open && Number(m[4]) <= 12) close += 12 * 60;
      else close += 24 * 60;
    }
    if (open >= 0 && open < 24 * 60 && close > open) out.push([open, close]);
  }
  return out;
}

// -> { always: true } | { days: { 0..6: [[open, close], ...] } } | null (not understood)
export function parseHours(text) {
  const c = clean(text);
  if (!c) return null;
  if (ALWAYS.test(c) && !/\d{1,2}:\d{2}/.test(c.replace(ALWAYS, ""))) return { always: true };

  const clauses = c.split(/[,;/\n&]|\s+en\s+|\s+and\s+/).map((x) => x.trim()).filter(Boolean);
  const days = {};
  let understood = false;
  let hasTimes = false;
  for (const clause of clauses) {
    const ranges = rangesFromClause(clause);
    const clauseDays = daysFromClause(clause);
    const closed = CLOSED.test(clause);
    if (ranges.length === 0 && !(closed && clauseDays.length)) continue;
    const target = clauseDays.length ? clauseDays : [0, 1, 2, 3, 4, 5, 6];
    if (ranges.length > 0) hasTimes = true;
    for (const d of target) {
      if (closed && ranges.length === 0) {
        days[d] = [];
      } else {
        days[d] = [...(days[d] || []), ...ranges];
      }
    }
    understood = true;
  }
  return understood && hasTimes ? { days } : null;
}

// South African time, whatever the visitor's phone says
export function saNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Johannesburg",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const dow = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get("weekday")];
  return { dow, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export const hhmm = (mins) => {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

// -> { known: false } | { known: true, open: true, closesAt } | { known: true, open: false, next: { dayOffset, dow, time } | null }
export function openStatus(hoursText, date = new Date()) {
  const parsed = parseHours(hoursText);
  if (!parsed) return { known: false };
  if (parsed.always) return { known: true, open: true, always: true };

  const { dow, minutes } = saNow(date);
  const today = parsed.days[dow] || [];
  for (const [o, c] of today) {
    if (minutes >= o && minutes < Math.min(c, 1440 + 1440)) return { known: true, open: true, closesAt: hhmm(c) };
  }
  const yesterday = parsed.days[(dow + 6) % 7] || [];
  for (const [, c] of yesterday) {
    if (c > 1440 && minutes < c - 1440) return { known: true, open: true, closesAt: hhmm(c) };
  }
  // when do they open next?
  for (let offset = 0; offset < 8; offset++) {
    const d = (dow + offset) % 7;
    const list = [...(parsed.days[d] || [])].sort((a, b) => a[0] - b[0]);
    for (const [o] of list) {
      if (offset > 0 || o > minutes) return { known: true, open: false, next: { dayOffset: offset, dow: d, time: hhmm(o) } };
    }
  }
  return { known: true, open: false, next: null };
}
