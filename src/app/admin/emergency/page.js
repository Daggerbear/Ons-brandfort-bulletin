"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminEmergency() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [category, setCategory] = useState("Emergency");

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") setAuthenticated(true);
    setChecked(true);
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("emergency_contacts")
      .select("*")
      .order("category", { ascending: true });
    setContacts(data || []);
  };

  useEffect(() => { if (authenticated) loadData(); }, [authenticated]);

  const updateContact = async (id, field, value) => {
    await supabase.from("emergency_contacts").update({ [field]: value }).eq("id", id);
  };

  const deleteContact = async (id) => {
    await supabase.from("emergency_contacts").delete().eq("id", id);
    loadData();
  };

  const addContact = async (e) => {
    e.preventDefault();
    if (!name.trim() || !number.trim()) return;
    await supabase.from("emergency_contacts").insert({ name, number, category });
    setName("");
    setNumber("");
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
        <h1 className="text-3xl font-bold mb-8 mt-4">Emergency Contacts</h1>

        <form onSubmit={addContact} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-8 space-y-2">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-neutral-800 rounded px-3 py-2 text-white"
          />
          <input
            type="text"
            placeholder="Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="w-full bg-neutral-800 rounded px-3 py-2 text-white"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-neutral-800 rounded px-3 py-2 text-white"
          >
            <option value="Emergency">Emergency</option>
            <option value="Doctors">Doctors</option>
            <option value="Other">Other</option>
          </select>
          <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm font-semibold">
            Add Contact
          </button>
        </form>

        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <input
                defaultValue={c.name}
                onBlur={(e) => updateContact(c.id, "name", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <input
                defaultValue={c.number}
                onBlur={(e) => updateContact(c.id, "number", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <p className="text-sm text-neutral-500 mb-2">{c.category}</p>
              <button onClick={() => deleteContact(c.id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}