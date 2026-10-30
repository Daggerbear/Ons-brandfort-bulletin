// src/components/QuestList.js
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const text = {
  af: {
    title: "MISSIES",
    daily: "Daagliks",
    weekly: "Weekliks",
    dailyNote: "Herstel middernag (SA tyd)",
    weeklyNote: "Herstel Maandag",
    min: "min",
    cafe: (n) => `Spandeer ${n} minute in Glitch Cafe`,
    radio: (n) => `Luister ${n} minute na Veldbrand Radio`,
  },
  en: {
    title: "QUESTS",
    daily: "Daily",
    weekly: "Weekly",
    dailyNote: "Resets at midnight (SA time)",
    weeklyNote: "Resets on Monday",
    min: "min",
    cafe: (n) => `Spend ${n} minutes in Glitch Cafe`,
    radio: (n) => `Listen to Veldbrand Radio for ${n} minutes`,
  },
};

const ICONS = { cafe: "🕹️", radio: "📻" };

export default function QuestList({ lang = "af" }) {
  const t = text[lang] || text.af;
  const [rows, setRows] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data, error } = await supabase.rpc("my_quests");
      if (active && !error) setRows(data || []);
    };
    load();
    const id = setInterval(load, 60000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  if (!rows || rows.length === 0) return null;

  const groups = [
    { key: "daily", title: t.daily, note: t.dailyNote },
    { key: "weekly", title: t.weekly, note: t.weeklyNote },
  ];

  return (
    <div className="mt-3 border-t border-cyan-400/20 pt-3">
      <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-300">
        [ {t.title} ]
      </p>

      {groups.map((g) => {
        const list = rows.filter((r) => r.o_period === g.key);
        if (list.length === 0) return null;
        return (
          <div key={g.key} className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-semibold text-neutral-200">{g.title}</p>
              <p className="text-[10px] text-neutral-500">{g.note}</p>
            </div>
            <div className="mt-2 space-y-3">
              {list.map((q) => {
                const target = Math.round(q.o_target / 60);
                const shown = q.o_done
                  ? target
                  : Math.min(Math.floor(q.o_seconds / 60), target);
                const pct = q.o_done
                  ? 100
                  : Math.min(100, Math.round((q.o_seconds / q.o_target) * 100));
                const label = (t[q.o_kind] || (() => q.o_quest_id))(target);
                return (
                  <div key={q.o_quest_id}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-neutral-300">
                        {ICONS[q.o_kind] || "⭐"} {label}
                      </p>
                      <p
                        className={`flex-shrink-0 text-xs font-semibold tabular-nums ${
                          q.o_done ? "text-green-400" : "text-cyan-300"
                        }`}
                      >
                        {q.o_done ? "✓" : "+"}
                        {q.o_xp} XP
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cyan-950">
                      <div
                        className={`h-full rounded-full transition-all ${
                          q.o_done
                            ? "bg-green-400"
                            : "bg-gradient-to-r from-cyan-400 to-blue-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] tabular-nums text-neutral-500">
                      {shown} / {target} {t.min}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}