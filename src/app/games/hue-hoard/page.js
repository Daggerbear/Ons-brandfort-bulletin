// src/app/games/hue-hoard/page.js
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

const SAVE_KEY = "hue_hoard_v1";
const OFFLINE_CAP = 4 * 3600;
const BOWL = [3, 4, 5, 6, 8];
const FINISH_MULT = [1, 2.5, 4];
const TONE_L = [0.9, 0.72, 0.5, 0.3, 0.14];
const TOTAL = 13 * 5 * 3;

const PIGMENTS = [
  { id: "red", ryb: 0, css: "#dc2626", need: null },
  { id: "yellow", ryb: 120, css: "#facc15", need: null },
  { id: "blue", ryb: 240, css: "#2563eb", need: null },
  { id: "orange", ryb: 60, css: "#f97316", need: "second" },
  { id: "green", ryb: 180, css: "#16a34a", need: "second" },
  { id: "violet", ryb: 300, css: "#7c3aed", need: "second" },
  { id: "white", light: 1, css: "#f5f5f5", need: "white" },
  { id: "black", light: -1, css: "#171717", need: "black" },
];
const PIG = Object.fromEntries(PIGMENTS.map((p) => [p.id, p]));

const RYB = [0, 60, 120, 180, 240, 300, 360];
const RGBH = [0, 30, 60, 120, 240, 285, 360];
function rybToHue(a) {
  for (let i = 0; i < RYB.length - 1; i++) {
    if (a <= RYB[i + 1]) {
      const f = (a - RYB[i]) / (RYB[i + 1] - RYB[i]);
      return RGBH[i] + f * (RGBH[i + 1] - RGBH[i]);
    }
  }
  return 0;
}

const UPGRADES = [
  { key: "bowl", icon: "🥣", max: 4, cost: (l) => [30, 150, 800, 5000][l] },
  { key: "white", icon: "🤍", max: 1, cost: () => 60 },
  { key: "black", icon: "🖤", max: 1, cost: () => 60 },
  { key: "second", icon: "🌈", max: 1, cost: () => 250 },
  { key: "metal", icon: "🪙", max: 1, cost: () => 400 },
  { key: "glow", icon: "✨", max: 1, cost: () => 2000 },
  { key: "brush", icon: "🖌️", max: 10, cost: (l) => Math.floor(25 * Math.pow(1.8, l)) },
  { key: "frames", icon: "🖼️", max: 10, cost: (l) => Math.floor(100 * Math.pow(2, l)) },
];

const HUES = {
  en: ["Red", "Orange", "Amber", "Lime", "Green", "Mint", "Cyan", "Azure", "Blue", "Violet", "Magenta", "Rose"],
  af: ["Rooi", "Oranje", "Amber", "Lemmetjie", "Groen", "Kruisement", "Siaan", "Asuur", "Blou", "Violet", "Magenta", "Roos"],
};
const TONES = {
  en: ["Pale", "Light", "", "Deep", "Dark"],
  af: ["Bleek", "Lig", "", "Diep", "Donker"],
};
const NEUTRAL = {
  en: ["Snow", "Ash", "Slate", "Charcoal", "Ink"],
  af: ["Sneeu", "As", "Leiklip", "Houtskool", "Ink"],
};
const FINISH = {
  en: ["Matte", "Metallic", "Glow"],
  af: ["Mat", "Metaal", "Gloed"],
};

const TEXT = {
  en: {
    title: "Hue Hoard", sub: "Mix. Discover. Collect every shade.",
    drops: "Drops", perSec: "/sec", tabs: ["Mix", "Gallery", "Upgrades"],
    bowl: "Your bowl", empty: "Tap a pigment to start mixing",
    mix: "Mix!", clear: "Clear", finish: "Finish", isNew: "NEW", known: "Known",
    found: "Discovered", fresh: "New shade discovered!", again: "Already in your gallery",
    bonus: "Collection bonus", welcome: "Welcome back!", away: "Your gallery earned",
    take: "Collect", back: "← Back to Glitch Cafe", maxed: "MAX", lvl: "Lv",
    up: {
      bowl: ["Bigger Bowl", "Hold more parts for finer mixes"],
      white: ["White Pigment", "Unlocks pale and light tints"],
      black: ["Black Pigment", "Unlocks deep and dark shades"],
      second: ["Secondary Pigments", "Adds orange, green and violet"],
      metal: ["Metallic Flakes", "A shiny finish worth 2.5x"],
      glow: ["Glow Dust", "A glowing finish worth 4x"],
      brush: ["Quick Hands", "+25% mixing rewards per level"],
      frames: ["Gallery Frames", "+25% gallery income per level"],
    },
  },
  af: {
    title: "Hue Hoard", sub: "Meng. Ontdek. Versamel elke skakering.",
    drops: "Druppels", perSec: "/sek", tabs: ["Meng", "Galery", "Opgraderings"],
    bowl: "Jou bak", empty: "Tik 'n pigment om te begin meng",
    mix: "Meng!", clear: "Maak leeg", finish: "Afwerking", isNew: "NUUT", known: "Bekend",
    found: "Ontdek", fresh: "Nuwe skakering ontdek!", again: "Reeds in jou galery",
    bonus: "Versamelingsbonus", welcome: "Welkom terug!", away: "Jou galery het verdien",
    take: "Neem", back: "← Terug na Glitch Cafe", maxed: "MAKS", lvl: "Vl",
    up: {
      bowl: ["Groter Bak", "Hou meer dele vir fyner mengsels"],
      white: ["Wit Pigment", "Ontsluit bleek en ligte tinte"],
      black: ["Swart Pigment", "Ontsluit diep en donker skakerings"],
      second: ["Sekondêre Pigmente", "Voeg oranje, groen en violet by"],
      metal: ["Metaalvlokkies", "'n Blink afwerking, 2.5x werd"],
      glow: ["Gloedstof", "'n Gloeiende afwerking, 4x werd"],
      brush: ["Vinnige Hande", "+25% mengbeloning per vlak"],
      frames: ["Galery-rame", "+25% galery-inkomste per vlak"],
    },
  },
};

const SUFFIX = ["", "K", "M", "B", "T", "Qa"];
function fmt(n, dec = false) {
  if (!isFinite(n)) return "∞";
  if (n < 1000) return dec && n < 100 ? n.toFixed(1) : Math.floor(n).toString();
  const i = Math.min(Math.floor(Math.log10(n) / 3), SUFFIX.length - 1);
  return (n / Math.pow(10, i * 3)).toFixed(2) + SUFFIX[i];
}

function mixInfo(parts) {
  if (!parts.length) return null;
  let sx = 0, sy = 0, n = 0, lt = 0;
  parts.forEach((id) => {
    const p = PIG[id];
    if (p.light) lt += p.light;
    else {
      const r = (p.ryb * Math.PI) / 180;
      sx += Math.cos(r);
      sy += Math.sin(r);
      n++;
    }
  });
  const len = n ? Math.hypot(sx, sy) / n : 0;
  const sat = Math.min(1, len * 1.6);
  const ryb = ((Math.atan2(sy, sx) * 180) / Math.PI + 360) % 360;
  const hue = n && len > 0.001 ? rybToHue(ryb) : 0;
  const L = 0.5 + (0.5 * lt) / parts.length;
  const tone = L >= 0.82 ? 0 : L >= 0.62 ? 1 : L >= 0.38 ? 2 : L >= 0.2 ? 3 : 4;
  const fam = sat < 0.18 ? 12 : Math.floor(hue / 30) % 12;
  return { hue, sat, L, tone, fam };
}

function shadeName(fam, tone, lang) {
  if (fam === 12) return NEUTRAL[lang][tone];
  const pre = TONES[lang][tone];
  return pre ? `${pre} ${HUES[lang][fam]}` : HUES[lang][fam];
}
function shadeCss(fam, tone) {
  const L = TONE_L[tone] * 100;
  return fam === 12 ? `hsl(0 0% ${L}%)` : `hsl(${fam * 30 + 15} 85% ${L}%)`;
}
function finishStyle(f, c) {
  if (f === 1)
    return { background: `linear-gradient(135deg, ${c} 0%, rgba(255,255,255,0.75) 35%, ${c} 55%, rgba(0,0,0,0.35) 100%)` };
  if (f === 2) return { background: c, boxShadow: `0 0 14px ${c}, 0 0 4px #fff8` };
  return { background: c };
}

function income(s) {
  const keys = Object.keys(s.found);
  let sum = 0;
  keys.forEach((k) => (sum += FINISH_MULT[+k.split("-")[2]] * 0.15));
  return sum * (1 + 0.25 * s.up.frames) * (1 + 0.02 * keys.length);
}

function freshState() {
  return {
    drops: 0,
    found: {},
    up: { bowl: 0, white: 0, black: 0, second: 0, metal: 0, glow: 0, brush: 0, frames: 0 },
    lastSeen: Date.now(),
  };
}

export default function HueHoard() {
  const { lang } = useLang();
  const L = lang === "af" ? "af" : "en";
  const t = TEXT[L];

  const S = useRef(null);
  const lastTick = useRef(Date.now());
  const [, force] = useState(0);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState(0);
  const [parts, setParts] = useState([]);
  const [finish, setFinish] = useState(0);
  const [gFin, setGFin] = useState(0);
  const [last, setLast] = useState(null);
  const [welcome, setWelcome] = useState(null);

  const save = () => {
    if (!S.current) return;
    S.current.lastSeen = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(S.current));
    } catch {}
  };

  useEffect(() => {
    let s = freshState();
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        s = { ...s, ...p, up: { ...s.up, ...(p.up || {}) }, found: p.found || {} };
      }
    } catch {}
    const elapsed = Math.min(Math.max((Date.now() - (s.lastSeen || Date.now())) / 1000, 0), OFFLINE_CAP);
    const gain = income(s) * elapsed;
    if (elapsed > 60 && gain > 0) {
      s.drops += gain;
      setWelcome({ gain });
    }
    s.lastSeen = Date.now();
    S.current = s;
    lastTick.current = Date.now();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const loop = setInterval(() => {
      const now = Date.now();
      const dt = Math.min((now - lastTick.current) / 1000, OFFLINE_CAP);
      lastTick.current = now;
      S.current.drops += income(S.current) * dt;
      force((n) => n + 1);
    }, 200);
    const saver = setInterval(save, 5000);
    const onHide = () => save();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      clearInterval(loop);
      clearInterval(saver);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      save();
    };
  }, [ready]);

  if (!ready || !S.current) return <main className="min-h-screen bg-black" />;

  const s = S.current;
  const bowlSize = BOWL[s.up.bowl];
  const avail = PIGMENTS.filter((p) => !p.need || s.up[p.need] > 0);
  const finishes = [0, ...(s.up.metal ? [1] : []), ...(s.up.glow ? [2] : [])];
  const info = mixInfo(parts);
  const foundCount = Object.keys(s.found).length;
  const rate = income(s);

  const previewCss = info ? `hsl(${info.hue} ${info.sat * 100}% ${info.L * 100}%)` : "#262626";
  const key = info ? `${info.fam}-${info.tone}-${finish}` : null;
  const willBeNew = key && !s.found[key];

  const addPart = (id) => {
    if (parts.length >= bowlSize) return;
    setParts([...parts, id]);
  };
  const removePart = (id) => {
    const i = parts.lastIndexOf(id);
    if (i < 0) return;
    setParts(parts.filter((_, j) => j !== i));
  };

  const doMix = () => {
    if (!info) return;
    const brush = Math.pow(1.25, s.up.brush);
    const isNew = !s.found[key];
    const gain = (isNew ? 8 * FINISH_MULT[finish] : 0.5 * (1 + foundCount * 0.05)) * brush;
    if (isNew) s.found[key] = 1;
    s.drops += gain;
    setLast({ name: shadeName(info.fam, info.tone, L), css: shadeCss(info.fam, info.tone), finish, isNew, gain, id: Date.now() });
    setParts([]);
    save();
    force((n) => n + 1);
  };

  const buyUp = (u) => {
    const lvl = s.up[u.key];
    if (lvl >= u.max) return;
    const c = u.cost(lvl);
    if (s.drops < c) return;
    s.drops -= c;
    s.up[u.key] = lvl + 1;
    save();
    force((n) => n + 1);
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(236,72,153,0.5), transparent 55%), radial-gradient(circle at 90% 40%, rgba(34,211,238,0.25), transparent 50%)" }}
      />
      <div className="relative z-10 max-w-md mx-auto px-4 pt-6 pb-20">
        <Link href="/games" className="text-sm text-neutral-500 hover:text-white">{t.back}</Link>

        <header className="text-center mt-4 mb-4">
          <h1
            className="text-4xl font-black uppercase tracking-widest"
            style={{ background: "linear-gradient(90deg,#f43f5e,#facc15,#22d3ee,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {t.title}
          </h1>
          <p className="text-neutral-400 text-sm mt-1">{t.sub}</p>
        </header>

        <div className="bg-neutral-900/80 border border-pink-500/40 rounded-2xl p-4 text-center mb-3">
          <p className="text-3xl font-black text-pink-400 tabular-nums">💧 {fmt(s.drops)}</p>
          <p className="text-xs text-neutral-400 mt-1 tabular-nums">
            {fmt(rate, true)} {t.perSec} · {t.found} {foundCount}/{TOTAL}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-1 mb-4">
          {t.tabs.map((name, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`text-xs font-bold uppercase tracking-wide rounded-full py-2 border transition ${
                tab === i ? "bg-pink-500 text-black border-pink-500" : "border-neutral-700 text-neutral-400"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div>
            {/* Bowl */}
            <div className="flex flex-col items-center">
              <div
                className="w-36 h-36 rounded-full border-4 border-neutral-700 transition-all duration-300"
                style={{ ...finishStyle(finish, previewCss), backgroundColor: previewCss }}
              />
              <p className="text-sm font-bold mt-3 h-5">
                {info ? shadeName(info.fam, info.tone, L) : t.empty}
                {info && (
                  <span className={`ml-2 text-[10px] rounded-full px-2 py-0.5 ${willBeNew ? "bg-pink-500 text-black" : "bg-neutral-800 text-neutral-400"}`}>
                    {willBeNew ? t.isNew : t.known}
                  </span>
                )}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {t.bowl}: {parts.length}/{bowlSize}
              </p>
              <div className="flex gap-1.5 mt-2 min-h-[28px] flex-wrap justify-center">
                {parts.map((id, i) => (
                  <span key={i} className="w-6 h-6 rounded-full border border-neutral-600" style={{ background: PIG[id].css }} />
                ))}
              </div>
            </div>

            {/* Pigments */}
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {avail.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addPart(p.id)}
                  onContextMenu={(e) => { e.preventDefault(); removePart(p.id); }}
                  disabled={parts.length >= bowlSize}
                  className="w-12 h-12 rounded-full border-2 border-white/30 active:scale-90 transition disabled:opacity-30"
                  style={{ background: p.css, touchAction: "manipulation" }}
                  aria-label={p.id}
                />
              ))}
            </div>

            {/* Finish */}
            {finishes.length > 1 && (
              <div className="flex items-center justify-center gap-1 mt-4">
                <span className="text-xs text-neutral-500 mr-1">{t.finish}</span>
                {finishes.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFinish(f)}
                    className={`text-xs font-bold rounded-full px-3 py-1 border ${
                      finish === f ? "bg-cyan-400 text-black border-cyan-400" : "border-neutral-700 text-neutral-400"
                    }`}
                  >
                    {FINISH[L][f]}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 mt-5">
              <button onClick={() => setParts([])} disabled={!parts.length} className="rounded-full py-3 border border-neutral-700 text-neutral-300 text-sm font-bold uppercase disabled:opacity-30">
                {t.clear}
              </button>
              <button
                onClick={doMix}
                disabled={!parts.length}
                className="col-span-2 rounded-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-black font-black uppercase tracking-wide disabled:opacity-30 active:scale-95 transition"
                style={{ boxShadow: "0 0 20px rgba(236,72,153,0.4)" }}
              >
                {t.mix}
              </button>
            </div>

            {last && (
              <div key={last.id} className={`mt-4 flex items-center gap-3 rounded-xl border p-3 ${last.isNew ? "border-pink-500 bg-pink-500/10 animate-pulse" : "border-neutral-800 bg-neutral-900"}`}>
                <span className="w-10 h-10 rounded-full flex-shrink-0" style={finishStyle(last.finish, last.css)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{last.name}</p>
                  <p className="text-xs text-neutral-400">{last.isNew ? t.fresh : t.again}</p>
                </div>
                <span className="text-sm font-bold text-pink-400 tabular-nums">+{fmt(last.gain, true)} 💧</span>
              </div>
            )}
          </div>
        )}

        {tab === 1 && (
          <div>
            <div className="flex justify-center gap-1 mb-3">
              {finishes.map((f) => (
                <button
                  key={f}
                  onClick={() => setGFin(f)}
                  className={`text-xs font-bold rounded-full px-3 py-1 border ${
                    gFin === f ? "bg-cyan-400 text-black border-cyan-400" : "border-neutral-700 text-neutral-400"
                  }`}
                >
                  {FINISH[L][f]}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-neutral-500 mb-3">
              {t.bonus}: +{foundCount * 2}%
            </p>
            <div className="flex flex-col gap-2">
              {[...Array(13).keys()].map((fam) => (
                <div key={fam} className="grid grid-cols-5 gap-1.5">
                  {[0, 1, 2, 3, 4].map((tone) => {
                    const got = s.found[`${fam}-${tone}-${gFin}`];
                    return (
                      <div
                        key={tone}
                        className="aspect-square rounded-lg border border-neutral-800 flex items-center justify-center text-neutral-700 text-lg"
                        style={got ? finishStyle(gFin, shadeCss(fam, tone)) : { background: "#111" }}
                        title={got ? shadeName(fam, tone, L) : "?"}
                      >
                        {!got && "?"}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div className="flex flex-col gap-2">
            {UPGRADES.map((u) => {
              const lvl = s.up[u.key];
              const maxed = lvl >= u.max;
              const cost = maxed ? 0 : u.cost(lvl);
              const can = !maxed && s.drops >= cost;
              return (
                <button
                  key={u.key}
                  onClick={() => buyUp(u)}
                  disabled={!can}
                  className="w-full flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-left disabled:opacity-50 enabled:hover:border-pink-400 transition"
                >
                  <span className="text-3xl">{u.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">
                      {t.up[u.key][0]}
                      {u.max > 1 && <span className="text-neutral-500"> {t.lvl} {lvl}/{u.max}</span>}
                    </p>
                    <p className="text-xs text-neutral-500">{t.up[u.key][1]}</p>
                  </div>
                  <span className="text-sm font-bold text-pink-400 tabular-nums flex-shrink-0">
                    {maxed ? t.maxed : `💧 ${fmt(cost)}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {welcome && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-6">
          <div className="bg-neutral-900 border-2 border-pink-400 rounded-2xl p-6 max-w-sm w-full text-center">
            <p className="text-2xl font-black text-pink-400">{t.welcome}</p>
            <p className="text-xs text-neutral-500 mt-3">{t.away}</p>
            <p className="text-3xl font-black tabular-nums">💧 {fmt(welcome.gain)}</p>
            <button onClick={() => setWelcome(null)} className="mt-5 w-full rounded-full py-2.5 bg-pink-400 text-black font-bold uppercase tracking-wide">
              {t.take}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}