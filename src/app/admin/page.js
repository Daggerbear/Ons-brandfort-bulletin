"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingBusinesses, setPendingBusinesses] = useState(0);
  const [pendingEvents, setPendingEvents] = useState(0);
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const loadCounts = async () => {
      const { count: bizPending } = await supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .neq("Status", "approved");
      setPendingBusinesses(bizPending ?? 0);

      const { count: bizTotal } = await supabase
        .from("businesses")
        .select("*", { count: "exact", head: true })
        .eq("Status", "approved");
      setTotalBusinesses(bizTotal ?? 0);

      const { count: evPending } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .neq("status", "approved");
      setPendingEvents(evPending ?? 0);

      const { count: evTotal } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");
      setTotalEvents(evTotal ?? 0);
    };
    loadCounts();
  }, [authenticated]);

  const checkPassword = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setSubmitting(false);

    if (res.ok) {
      sessionStorage.setItem("adminAuth", "true");
      setAuthenticated(true);
    } else {
      alert("Verkeerde wagwoord / Wrong password");
    }
  };

  const logout = () => {
    sessionStorage.removeItem("adminAuth");
    setAuthenticated(false);
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
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
          />
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

  const groups = [
    {
      label: "Needs Attention",
      icon: "🔔",
      sections: [
        {
          name: "Businesses",
          href: "/admin/businesses",
          desc: "Approve, edit, or reject listings — manage each business menu from its card",
          badge: pendingBusinesses > 0 ? pendingBusinesses : null,
        },
        {
          name: "Events",
          href: "/admin/events",
          desc: "Approve, edit, or reject events",
          badge: pendingEvents > 0 ? pendingEvents : null,
        },
        { name: "Gemeenskap Feed", href: "/admin/feed", desc: "Delete flagged or reported posts" },
        { name: "Classifieds", href: "/admin/classifieds", desc: "Moderate buy & sell listings" },
        { name: "Jobs", href: "/admin/jobs", desc: "Moderate job listings & work-seeker posts" },
        { name: "Riddles", href: "/admin/riddles", desc: "Manage Riddle Rush questions, answers, hints, and scheduling" },
        { name: "Riddle Winners", href: "/admin/riddle-winners", desc: "Manually trigger or test the monthly Riddle Rush winners post" },
      ],
    },
    {
      label: "Monetization",
      icon: "💰",
      sections: [
        { name: "Sponsored Ads", href: "/admin/ads", desc: "Add, edit, or remove sponsored flyer ads" },
        { name: "Featured Businesses", href: "/admin/featured", desc: "Manage the homepage carousel" },
        { name: "Games Carousel", href: "/admin/games-carousel", desc: "Manage the 6 sponsored slots on the games page" },
        { name: "Game Sponsors", href: "/admin/game-sponsors", desc: "Manage the sponsor banner for each individual game" },
      ],
    },
    {
      label: "Site Settings",
      icon: "⚙️",
      sections: [
        { name: "Site Backgrounds", href: "/admin/backgrounds", desc: "Manage backgrounds and images across the site" },
        { name: "Emergency Contacts", href: "/admin/emergency", desc: "Add, edit, or remove emergency numbers" },
      ],
    },
  ];

  const totalPending = pendingBusinesses + pendingEvents;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-neutral-500 text-sm mt-1">Ons Brandfort Bulletin</p>
          </div>
          <button onClick={logout} className="text-sm text-neutral-500 hover:text-orange-400">
            Log out
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div
            className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-4"
            style={{ boxShadow: "0 0 20px rgba(249,115,22,0.08)" }}
          >
            <p className="text-3xl font-black text-orange-500 tabular-nums">{totalPending}</p>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">Pending Review</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <p className="text-3xl font-black text-white tabular-nums">{totalBusinesses}</p>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">Live Businesses</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <p className="text-3xl font-black text-white tabular-nums">{totalEvents}</p>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">Live Events</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col justify-center">
            <p className={`text-sm font-semibold ${totalPending > 0 ? "text-orange-400" : "text-green-400"}`}>
              {totalPending > 0 ? "⚠ Action needed" : "✓ All caught up"}
            </p>
          </div>
        </div>

        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">{group.icon}</span>
              <h2 className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                {group.label}
              </h2>
            </div>
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
              {group.sections.map((s, i) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`flex items-center justify-between gap-3 hover:bg-neutral-900 transition px-5 py-4 ${
                    i !== group.sections.length - 1 ? "border-b border-neutral-800" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-orange-400">{s.name}</h3>
                    <p className="text-sm text-neutral-500 mt-0.5">{s.desc}</p>
                  </div>
                  {s.badge && (
                    <span
                      className="flex-shrink-0 bg-orange-500 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
                      style={{ boxShadow: "0 0 12px rgba(249,115,22,0.5)" }}
                    >
                      {s.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}