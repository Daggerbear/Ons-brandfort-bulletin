 // src/components/dash/Dashboard.js
// The business control panel: numbers, chart, live activity and every tool in one place.
"use client";
import { useState } from "react";
import Link from "next/link";
import { themeStyle } from "@/lib/bizTheme";
import ListingForm from "@/components/mybiz/ListingForm";
import StylePicker from "@/components/mybiz/StylePicker";
import { Glass, BigNumber, SectionLabel, dashBackground } from "./dashUi";
import useDashData from "./useDashData";
import AreaChart from "./AreaChart";
import ActivityFeed from "./ActivityFeed";
import ToolTiles from "./ToolTiles";
import QrPanel from "./QrPanel";
import PostPanel from "./PostPanel";
import LogoPanel from "./LogoPanel";

const TILES = [
  ["views", "👀", "tileViews"],
  ["contacts", "💬", "tileContacts"],
  ["orders", "🛒", "tileOrders"],
  ["scans", "🔳", "tileScans"],
];

function delta(cur, prev, d) {
  if (cur == null || prev == null) return null;
  if (prev === 0) return cur > 0 ? { text: d.isNew, up: true } : null;
  const pct = Math.round(((cur - prev) / prev) * 100);
  return { text: `${pct > 0 ? "+" : ""}${pct}%`, up: pct >= 0 };
}

function planLine(plan, t, lang) {
  if (!plan?.active) return t.planFree;
  const sub = plan.sub;
  if (sub?.source === "grandfathered" || !sub?.paid_until) return t.planStarterNow;
  const date = new Date(sub.paid_until).toLocaleDateString(lang === "en" ? "en-ZA" : "af-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return t.planStarterUntil(date);
}

export default function Dashboard({ biz, plan, menuEnabled, scheme, businesses, onSwitch, t, d, lang }) {
  const [days, setDays] = useState(7);
  const [view, setView] = useState("home"); // home | profile | style | qr | posts | logo | locked
  const data = useDashData(biz.id, days);
  const active = !!plan?.active;

  // Free tools in one row, paid tools in the next
  const tools = [
    { key: "profile", icon: "🧾", label: d.toolProfile, tier: "free", state: "open", panel: "profile" },
    { key: "posts", icon: "📢", label: d.toolPosts, tier: "free", state: "open", panel: "posts" },
    { key: "logo", icon: "🖼️", label: d.toolLogo, tier: "free", state: "open", panel: "logo" },
    { key: "menu", icon: "🛍️", label: d.toolMenu, tier: "paid", state: active ? "open" : "locked", href: `/my-business/${biz.id}/menu` },
    { key: "style", icon: "🎨", label: d.toolStyle, tier: "paid", state: active ? "open" : "locked", panel: "style" },
    { key: "qr", icon: "🔳", label: d.toolQr, tier: "paid", state: active ? "open" : "locked", panel: "qr" },
  ];


  const pick = (tool) => setView(tool.state === "locked" ? "locked" : tool.panel);

  const panelTitle = { profile: d.panelProfile, style: d.panelStyle, qr: d.panelQr, posts: d.panelPosts, logo: d.panelLogo, locked: d.lockedTitle }[view];

  return (
    <main
      className="min-h-screen px-4 pb-44 pt-6 sm:px-6"
      style={{ ...themeStyle(scheme), background: dashBackground, color: "var(--bz-text)" }}
    >
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm" style={{ color: "var(--bz-muted)" }}>
              {d.welcome}
            </p>
            <h1 className="break-words text-2xl font-black leading-tight">{biz.name}</h1>
            <span
              className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: "var(--bz-accent-soft)", border: "1px solid var(--bz-accent-line)", color: "var(--bz-accent-text)" }}
            >
              {planLine(plan, t, lang)}
            </span>
          </div>
          {biz.Status === "approved" && (
            <Link
              href={`/business/${biz.id}`}
              className="flex-shrink-0 rounded-full px-3 py-2 text-xs font-semibold"
              style={{ border: "1px solid var(--bz-accent-line)", color: "var(--bz-accent-text)" }}
            >
              {d.viewPage} ↗
            </Link>
          )}
        </div>

        {businesses.length > 1 && (
          <select
            value={biz.id}
            onChange={(e) => onSwitch(Number(e.target.value))}
            aria-label={d.switchBusiness}
            className="w-full rounded-xl px-3 py-3 text-sm"
            style={{ background: "var(--bz-surface)", border: "1px solid var(--bz-border)", color: "var(--bz-text)" }}
          >
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        {view !== "home" ? (
          /* A tool panel */
          <Glass className="p-4 sm:p-5" glow>
            <button
              type="button"
              onClick={() => setView("home")}
              className="mb-3 text-sm font-semibold"
              style={{ color: "var(--bz-accent-text)" }}
            >
              {d.back}
            </button>
            <h2 className="mb-4 text-lg font-bold">{panelTitle}</h2>

            {view === "profile" && <ListingForm biz={biz} t={t} lang={lang} />}
            {view === "style" && <StylePicker biz={biz} t={t} lang={lang} />}
            {view === "qr" && <QrPanel biz={biz} menuEnabled={menuEnabled} scheme={scheme} d={d} />}
            {view === "posts" && <PostPanel biz={biz} d={d} />}
            {view === "logo" && <LogoPanel biz={biz} active={active} d={d} lang={lang} />}
            {view === "locked" && (
              <div>
                <p className="text-sm" style={{ color: "var(--bz-muted)" }}>
                  {d.lockedText}
                </p>
                <Link
                  href="/contact"
                  className="mt-4 inline-block rounded-lg px-4 py-3 text-sm font-bold"
                  style={{ background: "var(--bz-accent)", color: "var(--bz-on-accent)" }}
                >
                  {t.contactUs}
                </Link>
              </div>
            )}
          </Glass>
        ) : (
          <>
            {/* Period + stat tiles */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <SectionLabel>{t.statDays(days)}</SectionLabel>
                <div className="flex gap-2">
                  {[7, 30].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setDays(n)}
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={
                        days === n
                          ? { background: "var(--bz-accent)", color: "var(--bz-on-accent)" }
                          : { border: "1px solid var(--bz-border)", color: "var(--bz-muted)" }
                      }
                    >
                      {t.statDays(n)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TILES.map(([key, icon, label]) => {
                  const dl = delta(data.cur?.[key], data.prev?.[key], d);
                  return (
                    <Glass key={key} className="p-4" glow={key === "views"}>
                      <p className="mb-2 text-xs" style={{ color: "var(--bz-muted)" }}>
                        {icon} {d[label]}
                      </p>
                      <BigNumber>{data.cur ? data.cur[key] : "–"}</BigNumber>
                      {dl && (
                        <p className="mt-2 text-[11px] font-semibold" style={{ color: dl.up ? "#86efac" : "#fca5a5" }}>
                          {dl.up ? "▲" : "▼"} {dl.text}{" "}
                          <span className="font-normal" style={{ color: "var(--bz-muted)" }}>
                            {d.vsPrev(days)}
                          </span>
                        </p>
                      )}
                    </Glass>
                  );
                })}
              </div>
            </div>

            {/* Chart */}
            <Glass className="p-4">
              <SectionLabel>{d.chartTitle}</SectionLabel>
              <AreaChart series={data.series} emptyText={data.loading ? d.loading : d.chartEmpty} />
            </Glass>

            {/* Tools */}
            <ToolTiles tools={tools} d={d} t={t} onPick={pick} />

            {/* Live activity */}
            <ActivityFeed feed={data.feed} d={d} />
          </>
        )}
      </div>
    </main>
  );
}
