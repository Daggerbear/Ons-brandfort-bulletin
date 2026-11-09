// src/components/TownCard.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const text = {
  af: {
    title: "BRANDFORT GRID",
    building: "Besig om te bou",
    bb: "Bulletin Bucks",
    pool: "In die dorp belê",
    done: "Voltooi",
    queued: "Wag",
    top: "Top bydraers",
    hunters: "Hunters",
    allDone: "Alles is gebou! Meer projekte kom binnekort.",
    hint: "Verdien BB met missies en spandeer dit in die Grid.",
    loading: "Laai...",
    failed: "Kon nie die dorp laai nie.",
  },
  en: {
    title: "BRANDFORT GRID",
    building: "Now building",
    bb: "Bulletin Bucks",
    pool: "Invested in the town",
    done: "Built",
    queued: "Queued",
    top: "Top contributors",
    hunters: "Hunters",
    allDone: "Everything is built! More projects are coming.",
    hint: "Earn BB with missions and spend it in the Grid.",
    loading: "Loading...",
    failed: "Couldn't load the town.",
  },
};

function Bar({ label, have, need, color }) {
  const pct = need > 0 ? Math.min(100, Math.round((have / need) * 100)) : 100;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[11px] tabular-nums text-neutral-400">
        <span>{label}</span>
        <span>
          {have} / {need}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cyan-950">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TownCard({ lang = "af" }) {
  const t = text[lang] || text.af;
  const [state, setState] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.rpc("town_state").then(({ data, error }) => {
      if (!active) return;
      if (error || !data) setFailed(true);
      else setState(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (failed) {
    return <p className="text-sm text-neutral-500">{t.failed}</p>;
  }
  if (!state) {
    return <p className="text-sm text-neutral-500">{t.loading}</p>;
  }

  const name = (p) => (lang === "af" ? p.name_af : p.name_en);
  const current = state.projects.find((p) => p.status === "building");
  const done = state.projects.filter((p) => p.status === "done");

  return (
    <section className="rounded-2xl border border-cyan-400/40 bg-[#050b18] p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-300">[ {t.title} ]</p>
        <p className="text-[11px] text-neutral-500">
          {state.hunters} {t.hunters}
        </p>
      </div>

      {current ? (
        <div className="mt-4 rounded-xl border border-cyan-400/30 p-3">
          <p className="text-xs text-neutral-400">{t.building}</p>
          <p className="mt-0.5 text-lg font-black text-white">
            {current.icon} {name(current)}
          </p>
          <Bar label={`💠 ${t.bb}`} have={current.have_materials} need={current.needs_materials} color="bg-gradient-to-r from-cyan-400 to-blue-500" />
        </div>
      ) : (
        <p className="mt-4 text-sm text-cyan-200">{t.allDone}</p>
      )}

      <p className="mt-3 text-xs text-neutral-500">
        {t.pool}: {state.projects.reduce((n, p) => n + Math.min(p.have_materials, p.needs_materials), 0)} BB
      </p>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {state.projects.map((p) => (
          <div
            key={p.key}
            title={`${name(p)} · ${p.status === "done" ? t.done : p.status === "building" ? t.building : t.queued}`}
            className={`flex aspect-square items-center justify-center rounded-lg border text-xl ${
              p.status === "done"
                ? "border-cyan-400 bg-cyan-400/10"
                : p.status === "building"
                ? "border-cyan-400/60 bg-black animate-pulse"
                : "border-neutral-800 bg-black opacity-40"
            }`}
          >
            {p.icon}
          </div>
        ))}
      </div>
      <p className="mt-1 text-center text-[11px] text-neutral-500">
        {done.length} / {state.projects.length} {t.done.toLowerCase()}
      </p>

      {state.top.length > 0 ? (
        <div className="mt-4 border-t border-cyan-900/60 pt-3">
          <p className="text-[11px] font-bold tracking-[0.2em] text-cyan-300">{t.top}</p>
          <ol className="mt-2 space-y-1">
            {state.top.map((h, i) => (
              <li key={h.gamer_name} className="flex justify-between text-sm">
                <span className="text-neutral-200">
                  {i + 1}. {h.gamer_name}
                </span>
                <span className="tabular-nums text-cyan-300">{h.total} BB</span>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <p className="mt-4 text-xs text-neutral-500">{t.hint}</p>
      )}
    </section>
  );
}
