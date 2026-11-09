// src/components/QuestList.js
"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const text = {
  af: {
    title: "MISSIES",
    daily: "Daagliks",
    weekly: "Weekliks",
    dailyNote: "Herstel middernag (SA tyd)",
    weeklyNote: "Herstel Maandag",
    bonus: "Voltooi almal vir 'n bonus: +15 BB",
    walletTitle: "BULLETIN BUCKS",
    walletNote:
      "Verdien BB met missies. Binnekort kan jy dit in die Brandfort Grid spandeer.",
  },
  en: {
    title: "QUESTS",
    daily: "Daily",
    weekly: "Weekly",
    dailyNote: "Resets at midnight (SA time)",
    weeklyNote: "Resets on Monday",
    bonus: "Clear them all for a bonus: +15 BB",
    walletTitle: "BULLETIN BUCKS",
    walletNote:
      "Earn BB by completing missions. Soon you'll be able to spend them in Brandfort Grid.",
  },
};

const CATEGORY_ICONS = {
  checkin: "📍",
  play: "🕹️",
  listen: "📻",
  explore: "🧭",
  learn: "🧠",
  social: "💬",
  help: "🤝",
  challenge: "🔥",
  weekly: "⭐",
};

function progressOf(q) {
  const count = q.o_unit === "count";
  const target = count ? q.o_target : Math.max(1, Math.round(q.o_target / 60));
  const current = count ? q.o_seconds : Math.floor(q.o_seconds / 60);
  const shown = q.o_done ? target : Math.min(current, target);
  const pct = q.o_done
    ? 100
    : Math.min(100, Math.round((q.o_seconds / q.o_target) * 100));
  return { shown, target, pct, suffix: count ? "" : " min" };
}

function rewardOf(q) {
  const parts = [];
  if (q.o_xp > 0) parts.push(`${q.o_xp} XP`);
  if (q.o_loot_amount > 0) {
    parts.push(`${q.o_loot_amount} BB`);
  }
  return parts.join(" · ");
}

export default function QuestList({ lang = "af" }) {
  const t = text[lang] || text.af;
  const [rows, setRows] = useState(null);
  const [inv, setInv] = useState([]);

  const load = useCallback(async () => {
    const [q, i] = await Promise.all([
      supabase.rpc("my_quests"),
      supabase.from("hunter_inventory").select("item, qty"),
    ]);
    if (!q.error) setRows(q.data || []);
    if (!i.error) setInv(i.data || []);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60000);
    return () => clearInterval(id);
  }, [load]);

  if (!rows || rows.length === 0) return null;

  const bb = inv.find((r) => r.item === "bb")?.qty ?? 0;

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
        const doneCount = list.filter((r) => r.o_done).length;
        return (
          <div key={g.key} className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-semibold text-neutral-200">
                {g.title}{" "}
                <span className="tabular-nums text-cyan-300">
                  {doneCount}/{list.length}
                </span>
              </p>
              <p className="text-[10px] text-neutral-500">{g.note}</p>
            </div>
            <div className="mt-2 space-y-3">
              {list.map((q) => {
                const p = progressOf(q);
                const label =
                  (lang === "af" ? q.o_title_af : q.o_title_en) ||
                  q.o_title_en ||
                  q.o_quest_id;
                return (
                  <div key={q.o_quest_id}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-xs text-neutral-300">
                        {CATEGORY_ICONS[q.o_category] || "⭐"} {label}
                      </p>
                      <p
                        className={`flex-shrink-0 text-xs font-semibold tabular-nums ${
                          q.o_done ? "text-green-400" : "text-cyan-300"
                        }`}
                      >
                        {q.o_done ? "✓ " : "+"}
                        {rewardOf(q)}
                      </p>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cyan-950">
                      <div
                        className={`h-full rounded-full transition-all ${
                          q.o_done
                            ? "bg-green-400"
                            : "bg-gradient-to-r from-cyan-400 to-blue-500"
                        }`}
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] tabular-nums text-neutral-500">
                      {p.shown} / {p.target}
                      {p.suffix}
                    </p>
                  </div>
                );
              })}
            </div>
            {g.key === "daily" && (
              <p className="mt-2 text-[10px] text-amber-300/80">{t.bonus}</p>
            )}
          </div>
        );
      })}

      <div className="mt-4 rounded-xl border border-cyan-400/30 bg-black/40 p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold tracking-[0.25em] text-cyan-300">
            [ {t.walletTitle} ]
          </p>
          <p className="text-lg font-black tabular-nums text-white">
            {bb} <span className="text-sm text-cyan-300">BB</span>
          </p>
        </div>
        <p className="mt-1 text-[10px] text-neutral-500">{t.walletNote}</p>
      </div>
    </div>
  );
}