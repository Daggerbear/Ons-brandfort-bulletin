// src/app/admin/page.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Tools are grouped by what you are doing, not by who made them. Tiles show only the name;
// a number badge means something is waiting. Groups fold away so the page stays short.
const groups = [
  {
    id: "queue",
    label: "Review queue",
    icon: "🔔",
    accent: "text-orange-400",
    tile: "bg-orange-500/10 border-orange-500/30",
    sections: [
      { name: "Businesses", icon: "🏪", href: "/admin/businesses", badgeKey: "bizPending" },
      { name: "Claims", icon: "🔑", href: "/admin/claims", badgeKey: "claimPending" },
      { name: "Events", icon: "📅", href: "/admin/events", badgeKey: "evPending" },
      { name: "Updates", icon: "📢", href: "/admin/business-updates", badgeKey: "updPending" },
      { name: "Lientjie", icon: "🤖", href: "/admin/lientjie", badgeKey: "botPending" },
    ],
  },
  {
    id: "money",
    label: "Plans & money",
    icon: "💰",
    accent: "text-amber-400",
    tile: "bg-amber-500/10 border-amber-500/30",
    sections: [
      { name: "Plans & Access", icon: "🎟️", href: "/admin/plans", badgeKey: "planAlert" },
      { name: "Featured", icon: "⭐", href: "/admin/featured" },
      { name: "Sponsored Ads", icon: "🎯", href: "/admin/ads" },
    ],
  },
  {
    id: "community",
    label: "Community",
    icon: "💬",
    accent: "text-green-400",
    tile: "bg-green-500/10 border-green-500/30",
    sections: [
      { name: "Feed", icon: "💬", href: "/admin/feed" },
      { name: "Classifieds", icon: "🛒", href: "/admin/classifieds" },
      { name: "Housing", icon: "🏠", href: "/admin/housing" },
      { name: "Jobs", icon: "💼", href: "/admin/jobs" },
    ],
  },
  {
    id: "games",
    label: "Glitch Cafe",
    icon: "🕹️",
    accent: "text-purple-400",
    tile: "bg-purple-500/10 border-purple-500/30",
    sections: [
      { name: "Riddles", icon: "🧩", href: "/admin/riddles" },
      { name: "Riddle Winners", icon: "🏆", href: "/admin/riddle-winners" },
      { name: "Games Carousel", icon: "🎠", href: "/admin/games-carousel" },
      { name: "Game Sponsors", icon: "🎮", href: "/admin/game-sponsors" },
    ],
  },
  {
    id: "insights",
    label: "Insights & site",
    icon: "📊",
    accent: "text-sky-400",
    tile: "bg-sky-500/10 border-sky-500/30",
    sections: [
      { name: "Analytics", icon: "📊", href: "/admin/analytics" },
      { name: "Backgrounds", icon: "🖼️", href: "/admin/backgrounds" },
      { name: "Emergency Contacts", icon: "🚨", href: "/admin/emergency" },
    ],
  },
];

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [open, setOpen] = useState({ queue: true });
  const [find, setFind] = useState("");
  const [counts, setCounts] = useState({
    bizPending: 0,
    bizLive: 0,
    evPending: 0,
    evLive: 0,
    updPending: 0,
    botPending: 0,
    claimPending: 0,
    planAlert: 0,
  });

  useEffect(() => {
    // Lientjie's page needs the password for this session too, so ask once more if it is missing
    if (sessionStorage.getItem("adminAuth") === "true" && sessionStorage.getItem("adminPw")) {
      setAuthenticated(true);
    } else {
      sessionStorage.removeItem("adminAuth");
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    const loadCounts = async () => {
      const head = { count: "exact", head: true };
      const [bizPending, bizLive, evPending, evLive, updPending, claimPending, planAlert] = await Promise.all([
        supabase.from("businesses").select("*", head).neq("Status", "approved"),
        supabase.from("businesses").select("*", head).eq("Status", "approved"),
        supabase.from("events").select("*", head).neq("status", "approved"),
        supabase.from("events").select("*", head).eq("status", "approved"),
        supabase.from("business_updates").select("*", head).neq("Status", "approved"),
        supabase.from("business_claims").select("*", head).eq("status", "pending"),
        supabase
          .from("business_subscriptions")
          .select("*", head)
          .neq("source", "grandfathered")
          .neq("status", "cancelled")
          .gt("paid_until", new Date(Date.now() - 14 * 86400000).toISOString())
          .lt("paid_until", new Date(Date.now() + 7 * 86400000).toISOString()),
      ]);

      let botPending = 0;
      try {
        const r = await fetch("/api/admin/bot?summary=1", {
          headers: { "x-admin-password": sessionStorage.getItem("adminPw") || "" },
          cache: "no-store",
        });
        if (r.ok) botPending = (await r.json()).pending ?? 0;
      } catch {}

      setCounts({
        botPending,
        bizPending: bizPending.count ?? 0,
        bizLive: bizLive.count ?? 0,
        evPending: evPending.count ?? 0,
        evLive: evLive.count ?? 0,
        updPending: updPending.count ?? 0,
        claimPending: claimPending.count ?? 0,
        planAlert: planAlert.count ?? 0,
      });
    };
    loadCounts();
  }, [authenticated]);

  const checkPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        sessionStorage.setItem("adminAuth", "true");
        sessionStorage.setItem("adminPw", password);
        setAuthenticated(true);
      } else {
        setLoginError("Verkeerde wagwoord / Wrong password");
      }
    } catch {
      setLoginError("Kon nie koppel nie / Couldn't connect");
    }

    setSubmitting(false);
  };

  const logout = () => {
    sessionStorage.removeItem("adminAuth");
    sessionStorage.removeItem("adminPw");
    setAuthenticated(false);
    setPassword("");
  };

  if (!checked) return null;

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 30%, rgba(249,115,22,0.25), transparent 60%)",
          }}
        />
        <form
          onSubmit={checkPassword}
          className="w-full max-w-sm space-y-5 relative bg-neutral-900/80 border border-neutral-800 rounded-2xl p-8"
          style={{ boxShadow: "0 0 40px rgba(249,115,22,0.12)" }}
        >
          <div className="text-center mb-2">
            <div
              className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/40 flex items-center justify-center text-2xl mb-4"
              style={{ boxShadow: "0 0 20px rgba(249,115,22,0.25)" }}
            >
              🔐
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-neutral-500 text-sm mt-1">Ons Brandfort Bulletin</p>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
          />
          {loginError && (
            <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-sm rounded-lg px-4 py-3 text-center">
              ⚠️ {loginError}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
            style={{ boxShadow: "0 0 24px rgba(249,115,22,0.3)" }}
          >
            {submitting ? "Checking..." : "Login"}
          </button>
        </form>
      </main>
    );
  }

  const totalPending = counts.bizPending + counts.evPending + counts.updPending + counts.botPending + counts.claimPending;

  const pendingChips = [
    { label: "Businesses", href: "/admin/businesses", n: counts.bizPending },
    { label: "Claims", href: "/admin/claims", n: counts.claimPending },
    { label: "Events", href: "/admin/events", n: counts.evPending },
    { label: "Updates", href: "/admin/business-updates", n: counts.updPending },
    { label: "Lientjie", href: "/admin/lientjie", n: counts.botPending },
  ].filter((c) => c.n > 0);

  const needle = find.trim().toLowerCase();
  const visibleGroups = groups
    .map((g) => ({ ...g, sections: needle ? g.sections.filter((s) => s.name.toLowerCase().includes(needle)) : g.sections }))
    .filter((g) => g.sections.length > 0);
  const groupBadge = (g) => g.sections.reduce((sum, s) => sum + (s.badgeKey ? counts[s.badgeKey] || 0 : 0), 0);

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-2xl font-black tracking-tight">Admin</h1>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-xs border border-neutral-700 hover:border-orange-500 hover:text-orange-400 transition rounded-full px-3 py-1 text-neutral-300">
              View site ↗
            </a>
            <button onClick={logout} className="text-xs text-neutral-500 hover:text-orange-400 px-2 py-1">Log out</button>
          </div>
        </div>

        {/* One line of what needs you */}
        <div
          className={`rounded-2xl p-4 mb-3 border ${
            totalPending > 0 ? "border-orange-500/40 bg-gradient-to-br from-orange-500/15 to-neutral-900" : "border-green-500/30 bg-gradient-to-br from-green-500/10 to-neutral-900"
          }`}
        >
          {totalPending > 0 ? (
            <>
              <p className="text-sm text-neutral-300">
                <span className="text-3xl font-black text-orange-400 tabular-nums mr-2 align-middle">{totalPending}</span>
                waiting for you
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {pendingChips.map((c) => (
                  <Link key={c.href} href={c.href} className="bg-orange-500 hover:bg-orange-600 transition text-black text-xs font-bold rounded-full px-3.5 py-1.5">
                    {c.label} · {c.n}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-green-400 font-semibold">✅ All caught up. Nothing is waiting.</p>
          )}
        </div>

        {/* Quick numbers */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            ["Live businesses", counts.bizLive],
            ["Live events", counts.evLive],
            ["Plans to check", counts.planAlert],
          ].map(([label, n]) => (
            <div key={label} className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5">
              <p className="text-xl font-black tabular-nums">{n}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-wide leading-tight">{label}</p>
            </div>
          ))}
        </div>

        <input
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="Find a tool…"
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-orange-500"
        />

        {visibleGroups.map((group) => {
          const isOpen = needle ? true : !!open[group.id];
          const badge = groupBadge(group);
          return (
            <div key={group.id} className="mb-3 bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpen((o) => ({ ...o, [group.id]: !o[group.id] }))}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
              >
                <span className="text-lg">{group.icon}</span>
                <span className={`flex-1 text-sm font-bold uppercase tracking-wide ${group.accent}`}>{group.label}</span>
                {!isOpen && badge > 0 && (
                  <span className="bg-orange-500 text-black text-xs font-bold rounded-full min-w-[22px] h-[22px] px-1.5 flex items-center justify-center">{badge}</span>
                )}
                <span className={`text-neutral-500 transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
              </button>
              {isOpen && (
                <div className="grid grid-cols-3 gap-2 px-3 pb-3">
                  {group.sections.map((s) => {
                    const n = s.badgeKey ? counts[s.badgeKey] : 0;
                    return (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="relative flex flex-col items-center justify-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-orange-500/60 transition px-1.5 py-3 text-center"
                      >
                        <span className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl ${group.tile}`}>{s.icon}</span>
                        <span className="text-[11px] font-semibold leading-tight text-neutral-200">{s.name}</span>
                        {n > 0 && (
                          <span className="absolute top-1.5 right-1.5 bg-orange-500 text-black text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">{n}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        {visibleGroups.length === 0 && <p className="text-sm text-neutral-500 text-center py-6">No tool matches “{find}”.</p>}
      </div>
    </main>
  );
}
