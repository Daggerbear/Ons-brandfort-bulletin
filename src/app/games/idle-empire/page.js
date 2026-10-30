// src/app/games/idle-empire/page.js
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";

const SAVE_KEY = "idle_empire_v1";
const OFFLINE_CAP = 8 * 3600; // seconds of offline earnings
const GROWTH = 1.15;
const MILESTONES = [10, 25, 50, 100, 200];
const STAR_BASE = 1e7; // run earnings needed for the first Legacy Star

const BUILDINGS = [
  { id: 0, icon: "🥟", cost: 15, rate: 0.1, name: { en: "Vetkoek Stall", af: "Vetkoekstalletjie" } },
  { id: 1, icon: "🏪", cost: 100, rate: 1, name: { en: "Spaza Shop", af: "Spaza-winkel" } },
  { id: 2, icon: "🚗", cost: 1100, rate: 8, name: { en: "Car Wash", af: "Karwas" } },
  { id: 3, icon: "🌾", cost: 12000, rate: 47, name: { en: "Farm", af: "Plaas" } },
  { id: 4, icon: "🥩", cost: 130000, rate: 260, name: { en: "Biltong Factory", af: "Biltongfabriek" } },
  { id: 5, icon: "🏗️", cost: 1.4e6, rate: 1400, name: { en: "Grain Silo", af: "Graansilo" } },
  { id: 6, icon: "📻", cost: 2e7, rate: 7800, name: { en: "Radio Tower", af: "Radiotoring" } },
  { id: 7, icon: "🏛️", cost: 3.3e8, rate: 44000, name: { en: "Town Hall", af: "Stadsaal" } },
];

const TEXT = {
  en: {
    title: "Idle Empire",
    sub: "Grow Brandfort. Even while you sleep.",
    coins: "Coins",
    perSec: "per second",
    tap: "Work the day",
    tapHint: "Tap to earn",
    buy: "Buy",
    max: "Max",
    owned: "Owned",
    each: "each",
    boots: "Better Boots",
    bootsDesc: "More coins per tap",
    legacy: "Legacy Stars",
    legacyDesc: "Each star gives +10% to everything.",
    prestige: "Start Over",
    prestigeNeed: "Earn more this run to unlock your first star.",
    prestigeGain: "You'd gain",
    prestigeAsk: "Start over and keep your Legacy Stars? Coins and buildings reset.",
    welcome: "Welcome back!",
    away: "You were away for",
    earned: "While gone you earned",
    collect: "Collect",
    back: "← Back to Glitch Cafe",
    h: "h",
    m: "m",
  },
  af: {
    title: "Idle Empire",
    sub: "Laat Brandfort groei. Selfs terwyl jy slaap.",
    coins: "Muntstukke",
    perSec: "per sekonde",
    tap: "Werk die dag",
    tapHint: "Tik om te verdien",
    buy: "Koop",
    max: "Maks",
    owned: "Besit",
    each: "elk",
    boots: "Beter Stewels",
    bootsDesc: "Meer munte per tik",
    legacy: "Nalatenskap-sterre",
    legacyDesc: "Elke ster gee +10% op alles.",
    prestige: "Begin Weer",
    prestigeNeed: "Verdien meer in hierdie rondte om jou eerste ster te ontsluit.",
    prestigeGain: "Jy sal kry",
    prestigeAsk: "Begin weer en hou jou sterre? Munte en geboue word teruggestel.",
    welcome: "Welkom terug!",
    away: "Jy was weg vir",
    earned: "Terwyl jy weg was het jy verdien",
    collect: "Neem",
    back: "← Terug na Glitch Cafe",
    h: "u",
    m: "m",
  },
};

const SUFFIX = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx"];

function fmt(n, dec = false) {
  if (!isFinite(n)) return "∞";
  if (n < 1000) return dec && n < 100 ? n.toFixed(1) : Math.floor(n).toString();
  let i = Math.min(Math.floor(Math.log10(n) / 3), SUFFIX.length - 1);
  return (n / Math.pow(10, i * 3)).toFixed(2) + SUFFIX[i];
}

function milestoneMult(owned) {
  let c = 0;
  for (const m of MILESTONES) if (owned >= m) c++;
  return Math.pow(2, c);
}

function nextMilestone(owned) {
  return MILESTONES.find((m) => owned < m) || null;
}

function starMult(stars) {
  return 1 + 0.1 * stars;
}

function totalRate(s) {
  let r = 0;
  BUILDINGS.forEach((b) => {
    const n = s.owned[b.id];
    r += b.rate * n * milestoneMult(n);
  });
  return r * starMult(s.stars);
}

function tapValue(s) {
  return (1 + s.tapLvl) * starMult(s.stars);
}

function bulkCost(b, owned, n) {
  return Math.ceil((b.cost * Math.pow(GROWTH, owned) * (Math.pow(GROWTH, n) - 1)) / (GROWTH - 1));
}

function maxAffordable(b, owned, coins) {
  const first = b.cost * Math.pow(GROWTH, owned);
  const n = Math.floor(Math.log((coins * (GROWTH - 1)) / first + 1) / Math.log(GROWTH));
  return Math.max(0, Math.min(n, 1000));
}

function bootsCost(lvl) {
  return Math.floor(50 * Math.pow(2.6, lvl));
}

function starsGain(runEarned) {
  return Math.floor(Math.sqrt(runEarned / STAR_BASE));
}

function freshState() {
  return {
    coins: 0,
    runEarned: 0,
    owned: BUILDINGS.map(() => 0),
    tapLvl: 0,
    stars: 0,
    lastSeen: Date.now(),
  };
}

export default function IdleEmpire() {
  const { lang } = useLang();
  const t = TEXT[lang === "af" ? "af" : "en"];
  const L = lang === "af" ? "af" : "en";

  const S = useRef(null);
  const lastTick = useRef(Date.now());
  const [, force] = useState(0);
  const [ready, setReady] = useState(false);
  const [welcome, setWelcome] = useState(null);
  const [mode, setMode] = useState(1); // 1, 10, "max"
  const [floaters, setFloaters] = useState([]);

  const save = () => {
    if (!S.current) return;
    S.current.lastSeen = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(S.current));
    } catch {}
  };

  // Load + offline earnings
  useEffect(() => {
    let s = freshState();
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        s = { ...s, ...p };
        if (!Array.isArray(s.owned) || s.owned.length !== BUILDINGS.length) {
          s.owned = BUILDINGS.map((_, i) => (p.owned && p.owned[i]) || 0);
        }
      }
    } catch {}
    const elapsed = Math.min(Math.max((Date.now() - (s.lastSeen || Date.now())) / 1000, 0), OFFLINE_CAP);
    const gain = totalRate(s) * elapsed;
    if (elapsed > 60 && gain > 0) {
      s.coins += gain;
      s.runEarned += gain;
      setWelcome({ gain, elapsed });
    }
    s.lastSeen = Date.now();
    S.current = s;
    lastTick.current = Date.now();
    setReady(true);
  }, []);

  // Game loop + saving
  useEffect(() => {
    if (!ready) return;
    const loop = setInterval(() => {
      const now = Date.now();
      const dt = Math.min((now - lastTick.current) / 1000, OFFLINE_CAP);
      lastTick.current = now;
      const g = totalRate(S.current) * dt;
      S.current.coins += g;
      S.current.runEarned += g;
      force((n) => n + 1);
    }, 100);
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

  if (!ready || !S.current) {
    return <main className="min-h-screen bg-black" />;
  }

  const s = S.current;
  const rate = totalRate(s);

  const doTap = (e) => {
    const v = tapValue(s);
    s.coins += v;
    s.runEarned += v;
    const id = Date.now() + Math.random();
    const x = 30 + Math.random() * 40;
    setFloaters((f) => [...f.slice(-8), { id, v, x }]);
    setTimeout(() => setFloaters((f) => f.filter((q) => q.id !== id)), 700);
    force((n) => n + 1);
  };

  const buy = (b) => {
    const owned = s.owned[b.id];
    const n = mode === "max" ? maxAffordable(b, owned, s.coins) : mode;
    if (n < 1) return;
    const cost = bulkCost(b, owned, n);
    if (s.coins < cost) return;
    s.coins -= cost;
    s.owned[b.id] += n;
    save();
    force((x) => x + 1);
  };

  const buyBoots = () => {
    const c = bootsCost(s.tapLvl);
    if (s.coins < c) return;
    s.coins -= c;
    s.tapLvl += 1;
    save();
    force((x) => x + 1);
  };

  const gain = starsGain(s.runEarned);
  const doPrestige = () => {
    if (gain < 1) return;
    if (!window.confirm(t.prestigeAsk)) return;
    const stars = s.stars + gain;
    const fresh = freshState();
    fresh.stars = stars;
    S.current = fresh;
    save();
    force((x) => x + 1);
  };

  const hrs = welcome ? Math.floor(welcome.elapsed / 3600) : 0;
  const mins = welcome ? Math.floor((welcome.elapsed % 3600) / 60) : 0;

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 50% 10%, rgba(251,191,36,0.45), transparent 60%)" }}
      />

      <div className="relative z-10 max-w-md mx-auto px-4 pt-6 pb-16">
        <Link href="/games" className="text-sm text-neutral-500 hover:text-white">
          {t.back}
        </Link>

        <header className="text-center mt-4 mb-5">
          <h1
            className="text-4xl font-black uppercase tracking-widest"
            style={{ color: "#fbbf24", textShadow: "0 0 16px rgba(251,191,36,0.5)" }}
          >
            {t.title}
          </h1>
          <p className="text-neutral-400 text-sm mt-1">{t.sub}</p>
        </header>

        {/* Stats */}
        <div className="bg-neutral-900/80 border border-amber-500/40 rounded-2xl p-4 text-center mb-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">{t.coins}</p>
          <p className="text-4xl font-black text-amber-400 tabular-nums">🪙 {fmt(s.coins)}</p>
          <p className="text-sm text-neutral-400 mt-1 tabular-nums">
            {fmt(rate, true)} {t.perSec}
            {s.stars > 0 && <span className="text-amber-300"> · ⭐ {s.stars}</span>}
          </p>
        </div>

        {/* Tap */}
        <div className="relative mb-4">
          <button
            onClick={doTap}
            className="w-full rounded-2xl py-6 bg-gradient-to-br from-amber-500 to-orange-600 active:scale-[0.98] transition font-black text-xl uppercase tracking-wide text-black select-none"
            style={{ boxShadow: "0 0 24px rgba(251,191,36,0.35)", touchAction: "manipulation" }}
          >
            ⛏️ {t.tap}
            <span className="block text-xs font-semibold normal-case opacity-80 mt-0.5">
              {t.tapHint} +{fmt(tapValue(s), true)}
            </span>
          </button>
          {floaters.map((f) => (
            <span
              key={f.id}
              className="absolute top-0 text-amber-300 font-black pointer-events-none animate-ping"
              style={{ left: `${f.x}%` }}
            >
              +{fmt(f.v, true)}
            </span>
          ))}
        </div>

        {/* Buy mode */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wide text-neutral-500">{t.buy}</p>
          <div className="flex gap-1">
            {[1, 10, "max"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-xs font-bold rounded-full px-3 py-1 border transition ${
                  mode === m
                    ? "bg-amber-400 text-black border-amber-400"
                    : "border-neutral-700 text-neutral-400"
                }`}
              >
                {m === "max" ? t.max : `x${m}`}
              </button>
            ))}
          </div>
        </div>

        {/* Boots */}
        <button
          onClick={buyBoots}
          disabled={s.coins < bootsCost(s.tapLvl)}
          className="w-full flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3 mb-2 text-left disabled:opacity-50 enabled:hover:border-amber-400 transition"
        >
          <span className="text-2xl">🥾</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">
              {t.boots} <span className="text-neutral-500">Lv {s.tapLvl}</span>
            </p>
            <p className="text-xs text-neutral-500">{t.bootsDesc}</p>
          </div>
          <span className="text-sm font-bold text-amber-400 tabular-nums">🪙 {fmt(bootsCost(s.tapLvl))}</span>
        </button>

        {/* Buildings */}
        <div className="flex flex-col gap-2">
          {BUILDINGS.map((b) => {
            const owned = s.owned[b.id];
            const n = mode === "max" ? Math.max(1, maxAffordable(b, owned, s.coins)) : mode;
            const cost = bulkCost(b, owned, n);
            const can = s.coins >= cost;
            const mult = milestoneMult(owned);
            const next = nextMilestone(owned);
            const each = b.rate * mult * starMult(s.stars);
            return (
              <button
                key={b.id}
                onClick={() => buy(b)}
                disabled={!can}
                className="w-full flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-left disabled:opacity-50 enabled:hover:border-amber-400 transition"
              >
                <span className="text-3xl">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">
                    {b.name[L]} <span className="text-neutral-500">×{owned}</span>
                    {mult > 1 && <span className="text-amber-300 text-xs"> · x{mult}</span>}
                  </p>
                  <p className="text-xs text-neutral-500 tabular-nums">
                    {fmt(each, true)} {t.each} {t.perSec.split(" ")[0] === "per" ? "/s" : "/s"}
                    {next && ` · x2 @ ${next}`}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-amber-400 tabular-nums">🪙 {fmt(cost)}</p>
                  <p className="text-[10px] text-neutral-500">+{n}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Legacy */}
        <div className="mt-6 border border-amber-500/30 bg-amber-500/5 rounded-2xl p-4 text-center">
          <p className="text-sm font-black uppercase tracking-wide text-amber-300">⭐ {t.legacy}</p>
          <p className="text-xs text-neutral-400 mt-1">{t.legacyDesc}</p>
          <p className="text-xs text-neutral-500 mt-2">
            {gain >= 1 ? `${t.prestigeGain} +${gain} ⭐` : t.prestigeNeed}
          </p>
          <button
            onClick={doPrestige}
            disabled={gain < 1}
            className="mt-3 text-sm font-bold uppercase tracking-wide rounded-full px-5 py-2 bg-amber-400 text-black disabled:opacity-30"
          >
            {t.prestige}
          </button>
        </div>
      </div>

      {/* Welcome back */}
      {welcome && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-6">
          <div className="bg-neutral-900 border-2 border-amber-400 rounded-2xl p-6 max-w-sm w-full text-center">
            <p className="text-2xl font-black text-amber-400">{t.welcome}</p>
            <p className="text-sm text-neutral-400 mt-2">
              {t.away} {hrs > 0 && `${hrs}${t.h} `}
              {mins}
              {t.m}
            </p>
            <p className="text-xs text-neutral-500 mt-3">{t.earned}</p>
            <p className="text-3xl font-black text-white tabular-nums">🪙 {fmt(welcome.gain)}</p>
            <button
              onClick={() => setWelcome(null)}
              className="mt-5 w-full rounded-full py-2.5 bg-amber-400 text-black font-bold uppercase tracking-wide"
            >
              {t.collect}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}