"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminShoutouts() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [shoutouts, setShoutouts] = useState([]);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") setAuthenticated(true);
    setChecked(true);
  }, []);

  const loadData = async () => {
    const { data } = await supabase.from("shoutouts").select("*").order("flag_count", { ascending: false });
    setShoutouts(data || []);
  };

  useEffect(() => { if (authenticated) loadData(); }, [authenticated]);

  const deleteShoutout = async (id) => {
    await supabase.from("shoutouts").delete().eq("id", id);
    loadData();
  };

  if (!checked) return null;
  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <p className="text-neutral-400">Please <Link href="/admin" className="text-orange-400">log in</Link> first.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-sm text-orange-400 hover:text-orange-300">← Terug na Admin Panel</Link>
        <h1 className="text-3xl font-bold mb-8 mt-4">Shoutouts</h1>

        <div className="space-y-3">
          {shoutouts.map((s) => (
            <div key={s.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <p className="text-white">{s.message}</p>
              <p className="text-sm text-neutral-500 mt-1">— {s.name} · flags: {s.flag_count}</p>
              <button onClick={() => deleteShoutout(s.id)} className="mt-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}