// src/components/HunterCards.js
"use client";
import Link from "next/link";

const text = {
  af: {
    mission: "MISSIE",
    open: "Sien al jou missies",
    promoTitle: "Word 'n Hunter 🎯",
    promoBody:
      "Voltooi daaglikse missies, verdien Bulletin Bucks en klim vlakke. Dis opsioneel en gratis.",
    promoButton: "Begin",
    dismiss: "Nie nou nie",
  },
  en: {
    mission: "MISSION",
    open: "See all your missions",
    promoTitle: "Become a Hunter 🎯",
    promoBody:
      "Complete daily missions, earn Bulletin Bucks and level up. It's optional and free.",
    promoButton: "Get started",
    dismiss: "Not now",
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

// One mission, shown inside the feed for people who are Hunters
export function MissionCard({ quest, lang = "af" }) {
  const t = text[lang] || text.af;
  const count = quest.o_unit === "count";
  const target = count ? quest.o_target : Math.max(1, Math.round(quest.o_target / 60));
  const current = count ? quest.o_seconds : Math.floor(quest.o_seconds / 60);
  const shown = quest.o_done ? target : Math.min(current, target);
  const pct = quest.o_done
    ? 100
    : Math.min(100, Math.round((quest.o_seconds / quest.o_target) * 100));
  const label =
    (lang === "af" ? quest.o_title_af : quest.o_title_en) ||
    quest.o_title_en ||
    quest.o_quest_id;

  const reward = [];
  if (quest.o_xp > 0) reward.push(`${quest.o_xp} XP`);
  if (quest.o_loot_amount > 0) {
    reward.push(`${quest.o_loot_amount} BB`);
  }

  return (
    <Link
      href="/profile/hunter"
      className="block rounded-2xl border border-cyan-400/40 bg-[#050b18] p-4 transition hover:border-cyan-300"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-[0.25em] text-cyan-300">
          [ {t.mission} ]
        </span>
        <span className="text-xs font-semibold tabular-nums text-cyan-300">
          +{reward.join(" · ")}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-white">
        {CATEGORY_ICONS[quest.o_category] || "⭐"} {label}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cyan-950">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 flex justify-between text-[10px] tabular-nums text-neutral-500">
        <span>
          {shown} / {target}
          {count ? "" : " min"}
        </span>
        <span>{t.open} ›</span>
      </p>
    </Link>
  );
}

// Shown once in the feed to signed-in people who haven't opted in yet
export function HunterPromoCard({ lang = "af", onDismiss }) {
  const t = text[lang] || text.af;
  return (
    <div className="rounded-2xl border border-cyan-400/30 bg-[#050b18] p-4">
      <p className="text-sm font-black text-white">{t.promoTitle}</p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-400">{t.promoBody}</p>
      <div className="mt-3 flex items-center gap-3">
        <Link
          href="/profile/hunter"
          className="rounded-full bg-cyan-400 px-4 py-1.5 text-xs font-bold text-black transition hover:bg-cyan-300"
        >
          {t.promoButton}
        </Link>
        <button
          onClick={onDismiss}
          className="text-xs text-neutral-500 hover:text-neutral-300"
        >
          {t.dismiss}
        </button>
      </div>
    </div>
  );
}