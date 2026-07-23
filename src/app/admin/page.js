"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  const checkPassword = (e) => {
    e.preventDefault();
    if (password === "Daggerbear132580#") {
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
            className="w-full bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-3"
          >
            Login
          </button>
        </form>
      </main>
    );
  }

  const sections = [
    { name: "Businesses", href: "/admin/businesses", desc: "Approve, edit, or reject business listings" },
    { name: "Events", href: "/admin/events", desc: "Approve, edit, or reject events" },
    { name: "Brandfort Vra", href: "/admin/vra", desc: "Delete flagged questions or answers" },
    { name: "Lost & Found", href: "/admin/lost-found", desc: "Delete flagged items" },
    { name: "Shoutouts", href: "/admin/shoutouts", desc: "Delete flagged shoutouts" },
    { name: "Emergency Contacts", href: "/admin/emergency", desc: "Add, edit, or remove emergency numbers" },
  ];

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button
            onClick={logout}
            className="text-sm text-neutral-500 hover:text-orange-400"
          >
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