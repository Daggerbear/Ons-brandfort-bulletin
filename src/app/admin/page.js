"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkPassword = (e) => {
    e.preventDefault();
    if (password === "Daggerbear132580#") {
      setAuthenticated(true);
    } else {
      alert("Verkeerde wagwoord / Wrong password");
    }
  };

  const loadData = async () => {
    setLoading(true);
    const { data: bizData } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
    const { data: eventData } = await supabase.from("events").select("*").order("created_at", { ascending: false });
    setBusinesses(bizData || []);
    setEvents(eventData || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const updateBusiness = async (id, field, value) => {
    await supabase.from("businesses").update({ [field]: value }).eq("id", id);
  };

  const updateEvent = async (id, field, value) => {
    await supabase.from("events").update({ [field]: value }).eq("id", id);
  };

  const approveBusiness = async (id) => {
    await supabase.from("businesses").update({ Status: "approved" }).eq("id", id);
    loadData();
  };

  const rejectBusiness = async (id) => {
    await supabase.from("businesses").delete().eq("id", id);
    loadData();
  };

  const approveEvent = async (id) => {
    await supabase.from("events").update({ status: "approved" }).eq("id", id);
    loadData();
  };

  const rejectEvent = async (id) => {
    await supabase.from("events").delete().eq("id", id);
    loadData();
  };

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

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {loading && <p className="text-neutral-400">Loading...</p>}

        <h2 className="text-xl font-bold mb-4 text-orange-400">Businesses</h2>
        <div className="space-y-4 mb-10">
          {businesses.map((b) => (
            <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <input
                defaultValue={b.name}
                onBlur={(e) => updateBusiness(b.id, "name", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <input
                defaultValue={b.category}
                onBlur={(e) => updateBusiness(b.id, "category", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <textarea
                defaultValue={b.description}
                onBlur={(e) => updateBusiness(b.id, "description", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <input
                defaultValue={b.contact}
                onBlur={(e) => updateBusiness(b.id, "contact", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <p className="text-sm text-neutral-400 mb-2">Status: {b.Status}</p>
              <div className="flex gap-2">
                <button onClick={() => approveBusiness(b.id)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">Approve</button>
                <button onClick={() => rejectBusiness(b.id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Reject / Delete</button>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4 text-orange-400">Events</h2>
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <input
                defaultValue={ev.title}
                onBlur={(e) => updateEvent(ev.id, "title", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <input
                defaultValue={ev.date}
                onBlur={(e) => updateEvent(ev.id, "date", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <input
                defaultValue={ev.time}
                onBlur={(e) => updateEvent(ev.id, "time", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <input
                defaultValue={ev.location}
                onBlur={(e) => updateEvent(ev.id, "location", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <textarea
                defaultValue={ev.description}
                onBlur={(e) => updateEvent(ev.id, "description", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <p className="text-sm text-neutral-400 mb-2">status: {ev.status}</p>
              <div className="flex gap-2">
                <button onClick={() => approveEvent(ev.id)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">Approve</button>
                <button onClick={() => rejectEvent(ev.id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Reject / Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}