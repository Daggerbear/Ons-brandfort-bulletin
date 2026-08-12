"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

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
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <form onSubmit={checkPassword} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-orange-500 outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
          >
            {submitting ? "Checking..." : "Login"}
          </button>
        </form>
      </main>
    );
  }

  const sections = [
    {
      name: "Businesses",
      href: "/admin/businesses",
      desc: "Approve, edit, or reject listings — manage each business menu from its card",
    },
    { name: "Events", href: "/admin/events", desc: "Approve, edit, or reject events" },
    { name: "Gemeenskap Feed", href: "/admin/feed", desc: "Delete flagged or reported posts" },
    { name: "Sponsored Ads", href: "/admin/ads", desc: "Add, edit, or remove sponsored flyer ads" },
    { name: "Featured Businesses", href: "/admin/featured", desc: "Manage the homepage carousel" },
    { name: "Classifieds", href: "/admin/classifieds", desc: "Moderate buy & sell listings" },
    { name: "Jobs", href: "/admin/jobs", desc: "Moderate job listings & work-seeker posts" },
    { name: "Site Backgrounds", href: "/admin/backgrounds", desc: "Manage backgrounds and images across the site" },
    { name: "Emergency Contacts", href: "/admin/emergency", desc: "Add, edit, or remove emergency numbers" },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button onClick={logout} className="text-sm text-neutral-500 hover:text-orange-400">
            Log out
          </button>
        </div>

        <div className="space-y-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="block bg-neutral-900 border border-neutral-800 hover:border-orange-500 transition rounded-xl p-5"
            >
              <h2 className="text-lg font-semibold text-orange-400">{s.name}</h2>
              <p className="text-sm text-neutral-400 mt-1">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
