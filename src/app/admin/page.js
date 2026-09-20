// src/app/admin/page.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const groups = [
  {
    label: "Needs Attention",
    icon: "🔔",
    accent: "text-orange-400",
    iconBg: "bg-orange-500/10 border-orange-500/30",
    sections: [
      { name: "Businesses", icon: "🏪", href: "/admin/businesses", desc: "Approve, edit, or reject listings — manage each business menu from its card", badgeKey: "bizPending" },
      { name: "Events", icon: "📅", href: "/admin/events", desc: "Approve, edit, or reject events", badgeKey: "evPending" },
      { name: "Business Updates", icon: "📢", href: "/admin/business-updates", desc: "Approve, edit, or reject business updates", badgeKey: "updPending" },
      { name: "Gemeenskap Feed", icon: "💬", href: "/admin/feed", desc: "Delete flagged or reported posts" },
      { name: "Classifieds", icon: "🛒", href: "/admin/classifieds", desc: "Moderate buy & sell listings" },
      { name: "Jobs", icon: "💼", href: "/admin/jobs", desc: "Moderate job listings & work-seeker posts" },
      { name: "Riddles", icon: "🧩", href: "/admin/riddles", desc: "Manage Riddle Rush questions, answers, hints, and scheduling" },
      { name: "Riddle Winners", icon: "🏆", href: "/admin/riddle-winners", desc: "Manually trigger or test the monthly Riddle Rush winners post" },
    ],
  },
  {
    label: "Insights",
    icon: "📊",
    accent: "text-sky-400",
    iconBg: "bg-sky-500/10 border-sky-500/30",
    sections: [
      { name: "Analytics", icon: "📊", href: "/admin/analytics", desc: "Traffic, top businesses, and popular searches — great for sales conversations" },
    ],
  },
  {
    label: "Monetization",
    icon: "💰",
    accent: "text-amber-400",
    iconBg: "bg-amber-500/10 border-amber-500/30",
    sections: [
      { name: "Sponsored Ads", icon: "🎯", href: "/admin/ads", desc: "Add, edit, or remove sponsored flyer ads" },
      { name: "Featured Businesses", icon: "⭐", href: "/admin/featured", desc: "Manage the homepage carousel" },
      { name: "Games Carousel", icon: "🎠", href: "/admin/games-carousel", desc: "Manage the 6 sponsored slots on the games page" },
      { name: "Game Sponsors", icon: "🎮", href: "/admin/game-sponsors", desc: "Manage the sponsor banner for each individual game" },
    ],
  },
  {
    label: "Site Settings",
    icon: "⚙️",
    accent: "text-neutral-300",
    iconBg: "bg-neutral-800 border-neutral-700",
    sections: [
      { name: "Site Backgrounds", icon: "🖼️", href: "/admin/backgrounds", desc: "Manage backgrounds and images across the site" },
      { name: "Emergency Contacts", icon: "🚨", href: "/admin/emergency", desc: "Add, edit, or remove emergency numbers" },
    ],
  },
];

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [counts, setCounts] = useState({
    bizPending: 0,
    bizLive: 0,
    evPending: 0,
    evLive: 0,
    updPending: 0,
  });

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    const loadCounts = async () => {
      const head = { count: "exact", head: true };
      const [bizPending, bizLive, evPending, evLive, updPending] = await Promise.all([
        supabase.from("businesses").select("*", head).neq("Status", "approved"),
        supabase.from("businesses").select("*", head).eq("Status", "approved"),
        supabase.from("events").select("*", head).neq("status", "approved"),
        supabase.from("events").select("*", head).eq("status", "approved"),
        supabase.from("business_updates").select("*", head).neq("Status", "approved"),
      ]);

      setCounts({
        bizPending: bizPending.count ?? 0,
        bizLive: bizLive.count ?? 0,
        evPending: evPending.count ?? 0,
        evLive: evLive.count ?? 0,
        updPending: updPending.count ?? 0,
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

  const totalPending = counts.bizPending + counts.evPending + counts.updPending;

  const pendingChips = [
    { label: "Businesses", href: "/admin/businesses", n: counts.bizPending },
    { label: "Events", href: "/admin/events", n: counts.evPending },
    { label: "Updates", href: "/admin/business-updates", n: counts.updPending },
  ].filter((c) => c.n > 0);

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Admin Panel</h1>
            <p className="text-neutral-500 text-sm mt-1">Ons Brandfort Bulletin</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm border border-neutral-700 hover:border-orange-500 hover:text-orange-400 transition rounded-full px-3 py-1 text-neutral-300"
            >
              View site ↗
            </a>
            <button
              onClick={logout}
              className="text-sm text-neutral-500 hover:text-orange-400 px-2 py-1"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Needs attention hero */}
        <div
          className={`rounded-2xl p-5 mb-4 border ${
            totalPending > 0
              ? "border-orange-500/40 bg-gradient-to-br from-orange-500/15 to-neutral-900"
              : "border-green-500/30 bg-gradient-to-br from-green-500/10 to-neutral-900"
          }`}
          style={{
            boxShadow:
              totalPending > 0
                ? "0 0 28px rgba(249,115,22,0.15)"
                : "0 0 28px rgba(34,197,94,0.1)",
          }}
        >
          {totalPending > 0 ? (
            <>
              <div className="flex items-end gap-3">
                <p className="text-5xl font-black text-orange-400 tabular-nums leading-none">
                  {totalPending}
                </p>
                <p className="text-sm text-neutral-300 pb-1">waiting for your review</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {pendingChips.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className="bg-orange-500 hover:bg-orange-600 transition text-black text-sm font-bold rounded-full px-4 py-1.5"
                  >
                    {c.label} · {c.n}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-4xl">✅</span>
              <div>
                <p className="text-lg font-bold text-green-400">All caught up</p>
                <p className="text-sm text-neutral-400">Nothing is waiting for review.</p>
              </div>
            </div>
          )}
        </div>

        {/* Live stats */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <p className="text-3xl font-black text-white tabular-nums">{counts.bizLive}</p>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">
              Live Businesses
            </p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <p className="text-3xl font-black text-white tabular-nums">{counts.evLive}</p>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">
              Live Events
            </p>
          </div>
        </div>

        {/* Groups */}
        {groups.map((group) => (
          <div key={group.label} className="mb-7">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">{group.icon}</span>
              <h2 className={`text-xs font-bold uppercase tracking-wide ${group.accent}`}>
                {group.label}
              </h2>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
              {group.sections.map((s, i) => {
                const badge = s.badgeKey ? counts[s.badgeKey] : 0;
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    className={`flex items-center gap-4 hover:bg-neutral-900 transition px-4 py-4 ${
                      i !== group.sections.length - 1 ? "border-b border-neutral-800" : ""
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xl flex-shrink-0 ${group.iconBg}`}
                    >
                      {s.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-white">{s.name}</h3>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{s.desc}</p>
                    </div>
                    {badge > 0 && (
                      <span
                        className="flex-shrink-0 bg-orange-500 text-black text-xs font-bold rounded-full min-w-[24px] h-6 px-1.5 flex items-center justify-center"
                        style={{ boxShadow: "0 0 12px rgba(249,115,22,0.5)" }}
                      >
                        {badge}
                      </span>
                    )}
                    <span className="text-neutral-600 flex-shrink-0">›</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}