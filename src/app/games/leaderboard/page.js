// src/app/games/leaderboard/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";

const TEXT = {
  af: {
    title: "Glitch Cafe Ranglys",
    sub: "Een ranglys vir al die speletjies. Dit herstel elke maand.",
    thisMonth: "Hierdie maand",
    lastMonth: "Verlede maand",
    player: "Speler",
    pts: "Punte",
    games: "Speletjies",
    empty: "Nog geen punte hierdie maand nie. Speel 'n speletjie en wees die eerste!",
    loading: "Laai...",
    error: "Kon nie die ranglys laai nie.",
    howTitle: "Hoe werk punte?",
    how: [
      "In elke arkade-speletjie tel jou beste telling van die maand. Nommer 1 kry 10 punte, nommer 2 kry 7, nommer 3 kry 5, dan 4, 3, 2 en 1 punt tot by nommer 10.",
      "Riddle Rush se maandpunte tel op dieselfde manier.",
      "Skaak, Dambord en Battleship: 1 punt vir elke wen teen 'n ander speler, tot 10 per maand.",
    ],
    back: "← Terug na Glitch Cafe",
  },
  en: {
    title: "Glitch Cafe Leaderboard",
    sub: "One leaderboard for every game. It resets each month.",
    thisMonth: "This month",
    lastMonth: "Last month",
    player: "Player",
    pts: "Points",
    games: "Games",
    empty: "No points yet this month. Play a game and be the first!",
    loading: "Loading...",
    error: "Couldn't load the leaderboard.",
    howTitle: "How do points work?",
    how: [
      "In each arcade game your best score of the month counts. 1st place gets 10 points, 2nd gets 7, 3rd gets 5, then 4, 3, 2 and 1 point down to 10th.",
      "Riddle Rush's monthly points are ranked the same way.",
      "Chess, Checkers and Battleship: 1 point for each win against another player, up to 10 a month.",
    ],
    back: "← Back to Glitch Cafe",
  },
};

function monthKey(offset) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function GlitchLeaderboard() {
  const { lang } = useLang();
  const t = TEXT[lang] || TEXT.en;

  const [offset, setOffset] = useState(0); // 0 = this month, -1 = last month
  const [rows, setRows] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setRows(null);
    setFailed(false);
    supabase
      .rpc("glitch_leaderboard", { p_month: monthKey(offset), p_limit: 20 })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setFailed(true);
        else setRows(data || []);
      });
    return () => {
      active = false;
    };
  }, [offset]);

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-5 py-8">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-2xl font-black">🏆 {t.title}</h1>
        <p className="mt-1 text-center text-sm text-neutral-400">{t.sub}</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {[0, -1].map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOffset(o)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                offset === o
                  ? "border-orange-500 bg-orange-500/15 text-orange-400"
                  : "border-neutral-800 bg-neutral-900 text-neutral-400"
              }`}
            >
              {o === 0 ? t.thisMonth : t.lastMonth}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
          <div className="grid grid-cols-[2.5rem_1fr_3.5rem_4rem] gap-2 border-b border-neutral-800 px-3 py-2 text-xs uppercase tracking-wide text-neutral-500">
            <span>#</span>
            <span>{t.player}</span>
            <span className="text-right">{t.games}</span>
            <span className="text-right">{t.pts}</span>
          </div>

          {rows === null && !failed && (
            <p className="px-3 py-6 text-center text-sm text-neutral-500">{t.loading}</p>
          )}
          {failed && (
            <p className="px-3 py-6 text-center text-sm text-red-400">{t.error}</p>
          )}
          {rows && rows.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-neutral-500">{t.empty}</p>
          )}
          {rows &&
            rows.map((row, i) => (
              <div
                key={`${row.player}-${i}`}
                className="grid grid-cols-[2.5rem_1fr_3.5rem_4rem] items-center gap-2 border-b border-neutral-800 px-3 py-2.5 text-sm last:border-0"
              >
                <span className="text-neutral-400">{MEDALS[i] || i + 1}</span>
                <span className="truncate font-semibold text-neutral-100">{row.player}</span>
                <span className="text-right text-neutral-500">{row.games}</span>
                <span className="text-right font-bold text-cyan-400">{row.points}</span>
              </div>
            ))}
        </div>

        <details className="mt-5 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-neutral-300">
            {t.howTitle}
          </summary>
          <ul className="mt-2 space-y-2 text-sm text-neutral-400">
            {t.how.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </details>

        <div className="mt-6 text-center">
          <Link href="/games" className="text-sm text-neutral-500 underline hover:text-white">
            {t.back}
          </Link>
        </div>
      </div>
    </main>
  );
}
