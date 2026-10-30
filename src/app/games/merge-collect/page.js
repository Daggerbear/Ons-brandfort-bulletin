// src/app/games/merge-collect/page.js
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

const SAVE_KEY = "merge_collect_v1";
const COLS = 5;
const CELLS = 30;
const TOP = 5;

const CHAINS = [
  { id: "farm", w: 35, icons: ["🌰", "🌱", "🌿", "🌷", "🌳", "🍎"], cell: "border-green-500/60 bg-green-500/10",
    name: { en: "Farm", af: "Plaas" },
    tiers: { en: ["Seed", "Sprout", "Bush", "Bloom", "Tree", "Apple"], af: ["Saad", "Spruit", "Bossie", "Blom", "Boom", "Appel"] } },
  { id: "workshop", w: 28, icons: ["🔩", "⚙️", "🔧", "🛠️", "🚜", "🏭"], cell: "border-orange-500/60 bg-orange-500/10",
    name: { en: "Workshop", af: "Werkswinkel" },
    tiers: { en: ["Bolt", "Gear", "Spanner", "Toolkit", "Tractor", "Factory"], af: ["Bout", "Rat", "Moersleutel", "Gereedskap", "Trekker", "Fabriek"] } },
  { id: "braai", w: 25, icons: ["🌽", "🥣", "🥩", "🍖", "🔥", "🍽️"], cell: "border-red-500/60 bg-red-500/10",
    name: { en: "Braai", af: "Braai" },
    tiers: { en: ["Maize", "Pap", "Steak", "Ribs", "Braai", "Feast"], af: ["Mielies", "Pap", "Biefstuk", "Ribbetjies", "Braai", "Fees"] } },
  { id: "sky", w: 8, rare: true, icons: ["💧", "🌧️", "⛈️", "🌈", "🌤️", "☀️"], cell: "border-cyan-400/60 bg-cyan-400/10",
    name: { en: "Sky", af: "Lug" },
    tiers: { en: ["Drop", "Rain", "Storm", "Rainbow", "Clearing", "Sunshine"], af: ["Druppel", "Reën", "Storm", "Reënboog", "Opklaring", "Sonskyn"] } },
  { id: "treasure", w: 4, rare: true, icons: ["🪨", "🔹", "💠", "💎", "👑", "🏆"], cell: "border-yellow-400/70 bg-yellow-400/10",
    name: { en: "Treasure", af: "Skat" },
    tiers: { en: ["Pebble", "Shard", "Crystal", "Diamond", "Crown", "Trophy"], af: ["Klippie", "Skerf", "Kristal", "Diamant", "Kroon", "Trofee"] } },
];

const UPS = [
  { key: "energy", icon: "🔋", max: 8, cost: (l) => 40 * Math.pow(2, l) },
  { key: "regen", icon: "⏱️", max: 8, cost: (l) => 60 * Math.pow(2, l) },
  { key: "seed", icon: "🍀", max: 8, cost: (l) => Math.floor(80 * Math.pow(1.9, l)) },
  { key: "luck", icon: "🔮", max: 6, cost: (l) => 120 * Math.pow(2, l) },
  { key: "sell", icon: "💰", max: 10, cost: (l) => Math.floor(50 * Math.pow(1.8, l)) },
];

const TEXT = {
  en: {
    title: "Merge & Collect", sub: "Merge. Discover. Complete the book.",
    tabs: ["Board", "Book", "Upgrades"], spawn: "Spawn", energy: "Energy",
    full: "Board is full! Merge or sell something.", noEnergy: "No energy. Wait or upgrade.",
    sell: "Sell", tip: "Tap an item, then tap a matching one to merge, or an empty tile to move.",
    discovered: "Discovered", rare: "RARE", complete: "Chain complete!", newItem: "New discovery!",
    back: "← Back to Glitch Cafe", maxed: "MAX", lvl: "Lv", next: "Next in",
    up: {
      energy: ["Bigger Battery", "+2 max energy per level"],
      regen: ["Fast Charger", "Energy refills 2s faster per level"],
      seed: ["Lucky Seeds", "+5% chance to spawn a tier 2 item"],
      luck: ["Rare Finder", "Rare chains appear more often"],
      sell: ["Haggler", "+20% coins when selling"],
    },
  },
  af: {
    title: "Merge & Collect", sub: "Voeg saam. Ontdek. Voltooi die boek.",
    tabs: ["Bord", "Boek", "Opgraderings"], spawn: "Skep", energy: "Energie",
    full: "Bord is vol! Voeg saam of verkoop iets.", noEnergy: "Geen energie. Wag of gradeer op.",
    sell: "Verkoop", tip: "Tik 'n item, dan 'n ooreenstemmende een om saam te voeg, of 'n leë blok om te skuif.",
    discovered: "Ontdek", rare: "SELDSAAM", complete: "Ketting voltooi!", newItem: "Nuwe ontdekking!",
    back: "← Terug na Glitch Cafe", maxed: "MAKS", lvl: "Vl", next: "Volgende in",
    up: {
      energy: ["Groter Battery", "+2 maks energie per vlak"],
      regen: ["Vinnige Laaier", "Energie vul 2s vinniger per vlak"],
      seed: ["Gelukkige Sade", "+5% kans vir 'n vlak 2 item"],
      luck: ["Seldsaam-Soeker", "Seldsame kettings verskyn meer"],
      sell: ["Afdingery", "+20% munte met verkoop"],
    },
  },
};

const SUFFIX = ["", "K", "M", "B", "T"];
function fmt(n) {
  if (n < 1000) return Math.floor(n).toString();
  const i = Math.min(Math.floor(Math.log10(n) / 3), SUFFIX.length - 1);
  return (n / Math.pow(10, i * 3)).toFixed(2) + SUFFIX[i];
}

const maxEnergy = (u) => 10 + 2 * u.energy;
const regenSec = (u) => 20 - 2 * u.regen;
const sellValue = (t, u) => Math.floor(5 * Math.pow(3, t) * (1 + 0.2 * u.sell));

function freshState() {
  return {
    coins: 0,
    board: Array(CELLS).fill(null),
    energy: 10,
    energyAt: Date.now(),
    found: {},
    done: {},
    up: { energy: 0, regen: 0, seed: 0, luck: 0, sell: 0 },
  };
}

function pickChain(luck) {
  const w = CHAINS.map((c) => (c.rare ? c.w * Math.pow(1.25, luck) : c.w));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) {
    r -= w[i];
    if (r <= 0) return i;
  }
  return 0;
}

export default function MergeCollect() {
  const { lang } = useLang();
  const L = lang === "af" ? "af" : "en";
  const t = TEXT[L];

  const S = useRef(null);
  const [, force] = useState(0);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState(0);
  const [sel, setSel] = useState(null);
  const [flash, setFlash] = useState(null);
  const [toast, setToast] = useState(null);

  const save = () => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(S.current));
    } catch {}
  };

  const say = (text) => {
    const id = Date.now() + Math.random();
    setToast({ text, id });
    setTimeout(() => setToast((c) => (c && c.id === id ? null : c)), 2200);
  };

  const tickEnergy = () => {
    const s = S.current;
    const max = maxEnergy(s.up);
    const step = regenSec(s.up) * 1000;
    const now = Date.now();
    if (s.energy >= max) {
      s.energy = Math.min(s.energy, Math.max(max, s.energy));
      s.energyAt = now;
      return;
    }
    while (s.energy < max && now - s.energyAt >= step) {
      s.energy += 1;
      s.energyAt += step;
    }
    if (s.energy >= max) s.energyAt = now;
  };

  useEffect(() => {
    let s = freshState();
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        s = { ...s, ...p, up: { ...s.up, ...(p.up || {}) } };
        if (!Array.isArray(s.board) || s.board.length !== CELLS) s.board = Array(CELLS).fill(null);
      }
    } catch {}
    S.current = s;
    tickEnergy();
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const loop = setInterval(() => {
      tickEnergy();
      force((n) => n + 1);
    }, 500);
    const onHide = () => save();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", onHide);
    return () => {
      clearInterval(loop);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onHide);
      save();
    };
  }, [ready]);

  if (!ready || !S.current) return <main className="min-h-screen bg-black" />;

  const s = S.current;
  const max = maxEnergy(s.up);
  const step = regenSec(s.up);
  const secsLeft = s.energy >= max ? 0 : Math.max(0, Math.ceil(step - (Date.now() - s.energyAt) / 1000));
  const foundCount = Object.keys(s.found).length;

  const discover = (ci, tier) => {
    const key = `${ci}-${tier}`;
    if (s.found[key]) return;
    s.found[key] = 1;
    s.coins += 10 * (tier + 1);
    const complete = [0, 1, 2, 3, 4, 5].every((x) => s.found[`${ci}-${x}`]);
    if (complete && !s.done[ci]) {
      s.done[ci] = 1;
      s.coins += 300 * (ci + 1);
      say(`🏆 ${CHAINS[ci].name[L]}: ${t.complete}`);
    } else {
      say(`${CHAINS[ci].icons[tier]} ${CHAINS[ci].tiers[L][tier]} · ${t.newItem}`);
    }
  };

  const spawn = () => {
    if (s.energy < 1) return say(t.noEnergy);
    const empty = [];
    s.board.forEach((c, i) => !c && empty.push(i));
    if (!empty.length) return say(t.full);
    const ci = pickChain(s.up.luck);
    const tier = Math.random() < 0.05 * s.up.seed ? 1 : 0;
    const at = empty[Math.floor(Math.random() * empty.length)];
    s.board[at] = { c: ci, t: tier };
    if (s.energy >= max) s.energyAt = Date.now();
    s.energy -= 1;
    discover(ci, tier);
    setFlash(at);
    setTimeout(() => setFlash(null), 350);
    save();
    force((n) => n + 1);
  };

  const tapCell = (i) => {
    const item = s.board[i];
    if (sel === null) {
      if (item) setSel(i);
      return;
    }
    if (sel === i) return setSel(null);
    const from = s.board[sel];
    if (!item) {
      s.board[i] = from;
      s.board[sel] = null;
      setSel(null);
    } else if (item.c === from.c && item.t === from.t && item.t < TOP) {
      s.board[sel] = null;
      s.board[i] = { c: item.c, t: item.t + 1 };
      s.coins += Math.pow(2, item.t + 1);
      discover(item.c, item.t + 1);
      setFlash(i);
      setTimeout(() => setFlash(null), 350);
      setSel(null);
    } else {
      setSel(i);
      return;
    }
    save();
    force((n) => n + 1);
  };

  const sellSel = () => {
    const item = s.board[sel];
    if (!item) return;
    s.coins += sellValue(item.t, s.up);
    s.board[sel] = null;
    setSel(null);
    save();
    force((n) => n + 1);
  };

  const buyUp = (u) => {
    const lvl = s.up[u.key];
    if (lvl >= u.max) return;
    const c = u.cost(lvl);
    if (s.coins < c) return;
    s.coins -= c;
    s.up[u.key] = lvl + 1;
    save();
    force((n) => n + 1);
  };

  const selItem = sel !== null ? s.board[sel] : null;

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.45), transparent 55%), radial-gradient(circle at 10% 60%, rgba(168,85,247,0.25), transparent 50%)" }}
      />
      <div className="relative z-10 max-w-md mx-auto px-4 pt-6 pb-20">
        <Link href="/games" className="text-sm text-neutral-500 hover:text-white">{t.back}</Link>

        <header className="text-center mt-4 mb-4">
          <h1
            className="text-3xl font-black uppercase tracking-widest"
            style={{ background: "linear-gradient(90deg,#22d3ee,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {t.title}
          </h1>
          <p className="text-neutral-400 text-sm mt-1">{t.sub}</p>
        </header>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-neutral-900/80 border border-cyan-500/40 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-cyan-300 tabular-nums">🪙 {fmt(s.coins)}</p>
            <p className="text-[11px] text-neutral-500">{t.discovered} {foundCount}/30</p>
          </div>
          <div className="bg-neutral-900/80 border border-purple-500/40 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-purple-300 tabular-nums">⚡ {s.energy}/{max}</p>
            <p className="text-[11px] text-neutral-500">{secsLeft > 0 ? `${t.next} ${secsLeft}s` : t.energy}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1 mb-4">
          {t.tabs.map((name, i) => (
            <button
              key={i}
              onClick={() => setTab(i)}
              className={`text-xs font-bold uppercase tracking-wide rounded-full py-2 border transition ${
                tab === i ? "bg-cyan-400 text-black border-cyan-400" : "border-neutral-700 text-neutral-400"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div>
            <div className="grid grid-cols-5 gap-1.5">
              {s.board.map((item, i) => {
                const isSel = sel === i;
                const match = selItem && item && !isSel && item.c === selItem.c && item.t === selItem.t && item.t < TOP;
                return (
                  <button
                    key={i}
                    onClick={() => tapCell(i)}
                    className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative transition ${
                      item ? CHAINS[item.c].cell : "border-neutral-800 bg-neutral-950"
                    } ${isSel ? "ring-2 ring-white scale-95" : ""} ${match ? "ring-2 ring-emerald-400" : ""} ${
                      flash === i ? "scale-110 brightness-150" : ""
                    }`}
                    style={{ touchAction: "manipulation" }}
                  >
                    {item && (
                      <>
                        <span className="text-2xl leading-none">{CHAINS[item.c].icons[item.t]}</span>
                        <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-neutral-400">{item.t + 1}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-neutral-500 text-center mt-3 min-h-[28px]">
              {selItem
                ? `${CHAINS[selItem.c].tiers[L][selItem.t]} · ${CHAINS[selItem.c].name[L]}`
                : t.tip}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-2">
              <button
                onClick={sellSel}
                disabled={!selItem}
                className="rounded-full py-3 border border-yellow-500/60 text-yellow-300 text-xs font-bold uppercase disabled:opacity-30"
              >
                {t.sell}{selItem ? ` +${fmt(sellValue(selItem.t, s.up))}` : ""}
              </button>
              <button
                onClick={spawn}
                className="col-span-2 rounded-full py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-black uppercase tracking-wide active:scale-95 transition disabled:opacity-40"
                style={{ boxShadow: "0 0 20px rgba(34,211,238,0.35)" }}
              >
                ✨ {t.spawn} (-1 ⚡)
              </button>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div className="flex flex-col gap-3">
            {CHAINS.map((ch, ci) => {
              const n = [0, 1, 2, 3, 4, 5].filter((x) => s.found[`${ci}-${x}`]).length;
              return (
                <div key={ch.id} className={`rounded-2xl border-2 p-3 ${ch.cell}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-black uppercase tracking-wide">
                      {ch.name[L]}
                      {ch.rare && <span className="ml-2 text-[9px] bg-black/60 border border-neutral-600 rounded-full px-2 py-0.5">{t.rare}</span>}
                    </p>
                    <p className="text-xs text-neutral-400">{s.done[ci] ? "🏆 " : ""}{n}/6</p>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {[0, 1, 2, 3, 4, 5].map((x) => {
                      const got = s.found[`${ci}-${x}`];
                      return (
                        <div key={x} className="flex flex-col items-center">
                          <div className="aspect-square w-full rounded-lg bg-black/50 flex items-center justify-center text-xl">
                            {got ? ch.icons[x] : <span className="text-neutral-700">?</span>}
                          </div>
                          <p className="text-[8px] text-neutral-500 mt-0.5 truncate w-full text-center">
                            {got ? ch.tiers[L][x] : ""}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 2 && (
          <div className="flex flex-col gap-2">
            {UPS.map((u) => {
              const lvl = s.up[u.key];
              const maxed = lvl >= u.max;
              const cost = maxed ? 0 : u.cost(lvl);
              const can = !maxed && s.coins >= cost;
              return (
                <button
                  key={u.key}
                  onClick={() => buyUp(u)}
                  disabled={!can}
                  className="w-full flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-left disabled:opacity-50 enabled:hover:border-cyan-400 transition"
                >
                  <span className="text-3xl">{u.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold">
                      {t.up[u.key][0]} <span className="text-neutral-500">{t.lvl} {lvl}/{u.max}</span>
                    </p>
                    <p className="text-xs text-neutral-500">{t.up[u.key][1]}</p>
                  </div>
                  <span className="text-sm font-bold text-cyan-300 tabular-nums flex-shrink-0">
                    {maxed ? t.maxed : `🪙 ${fmt(cost)}`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
          <div className="bg-neutral-900 border border-cyan-400 rounded-full px-4 py-2 text-sm font-bold shadow-lg">
            {toast.text}
          </div>
        </div>
      )}
    </main>
  );
}