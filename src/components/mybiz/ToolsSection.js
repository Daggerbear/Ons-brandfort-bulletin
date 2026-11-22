// src/components/mybiz/ToolsSection.js
// The PAID part of My Business: menu & ordering, page style, statistics, logo.
"use client";
import { useState } from "react";
import Link from "next/link";
import StylePicker from "./StylePicker";
import OwnerStats from "./OwnerStats";

// state: "open" | "locked" | "soon"
function ToolCard({ icon, title, desc, state, t, href, children }) {
  const [expanded, setExpanded] = useState(false);
  const open = state === "open";
  return (
    <div
      className={`rounded-xl border p-4 ${
        open ? "border-orange-500/60 bg-orange-500/10" : "border-dashed border-neutral-700 bg-neutral-950/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-2xl ${open ? "" : "opacity-50"}`}>{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`font-bold ${open ? "text-white" : "text-neutral-300"}`}>{title}</p>
            <span
              className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                open ? "bg-green-600/30 text-green-300" : "bg-neutral-800 text-neutral-400"
              }`}
            >
              {open ? t.active : state === "soon" ? t.comingSoon : `🔒 ${t.locked}`}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-400">{desc}</p>

          {open && href && (
            <Link
              href={href}
              className="mt-3 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black hover:bg-orange-600"
            >
              {t.open} ›
            </Link>
          )}
          {open && children && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-black hover:bg-orange-600"
            >
              {expanded ? t.close : `${t.open} ›`}
            </button>
          )}
          {state === "locked" && (
            <Link
              href="/contact"
              className="mt-3 inline-block rounded-lg border border-orange-500/60 px-4 py-2 text-sm font-semibold text-orange-300 hover:bg-orange-500/10"
            >
              {t.unlock}
            </Link>
          )}
          {open && children && expanded && children}
        </div>
      </div>
    </div>
  );
}

export default function ToolsSection({ biz, plan, t, lang }) {
  const active = !!plan?.active;
  const sub = plan?.sub;

  let planLine = t.planFree;
  if (active) {
    if (sub?.source === "grandfathered") planLine = t.planStarterNow;
    else if (sub?.paid_until) {
      const d = new Date(sub.paid_until).toLocaleDateString(lang === "en" ? "en-ZA" : "af-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      planLine = t.planStarterUntil(d);
    } else planLine = t.planStarterNow;
  }
  const state = active ? "open" : "locked";

  return (
    <div className="space-y-3">
      <p className="text-sm text-neutral-400">{t.toolsHelp}</p>
      <p
        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
          active ? "bg-green-600/20 text-green-300" : "bg-neutral-800 text-neutral-400"
        }`}
      >
        {planLine}
      </p>

      <ToolCard icon="🍽️" title={t.menuTool} desc={t.menuToolDesc} state={state} href={`/my-business/${biz.id}/menu`} t={t} />

      <ToolCard icon="🎨" title={t.styleTool} desc={t.styleToolDesc} state={state} t={t}>
        <StylePicker biz={biz} t={t} lang={lang} />
      </ToolCard>

      <ToolCard icon="📊" title={t.statsTool} desc={t.statsToolDesc} state={state} t={t}>
        <OwnerStats businessId={biz.id} t={t} />
      </ToolCard>

      <ToolCard icon="🖼️" title={t.logoTool} desc={t.logoToolDesc} state={active ? "soon" : "locked"} t={t} />
    </div>
  );
}
