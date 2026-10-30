// src/components/XpCard.js
"use client";
import { levelFromXp } from "@/lib/xp";
import QuestList from "@/components/QuestList";

const text = {
  af: {
    status: "STATUS",
    level: "VLAK",
    toNext: "XP tot die volgende vlak",
  },
  en: {
    status: "STATUS",
    level: "LEVEL",
    toNext: "XP to the next level",
  },
};

export default function XpCard({ totalXp = 0, lang = "af" }) {
  const t = text[lang] || text.af;
  const { level, xp, into, span, progress } = levelFromXp(totalXp);
  const pct = Math.round(progress * 100);

  return (
    <section
      aria-label="XP"
      className="rounded-2xl border border-cyan-400/40 bg-[#050b18] p-5 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
    >
      <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-300">
        [ {t.status} ]
      </p>

      <div className="mt-3 flex items-end justify-between">
        <p className="text-3xl font-black tracking-tight text-white">
          {t.level}{" "}
          <span className="tabular-nums text-cyan-300">{level}</span>
        </p>
        <p className="text-sm tabular-nums text-neutral-300">{xp} XP</p>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        className="mt-3 h-2.5 overflow-hidden rounded-full bg-cyan-950"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs tabular-nums text-neutral-400">
        {into} / {span} {t.toNext}
      </p>

      <QuestList lang={lang} />
    </section>
  );
}