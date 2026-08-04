"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminJobs() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setListings(data);
    setLoading(false);
  }

  async function toggleHidden(id, current) {
    await supabase.from("jobs").update({ is_hidden: !current }).eq("id", id);
    fetchAll();
  }

  async function toggleFilled(id, current) {
    await supabase.from("jobs").update({ is_filled: !current }).eq("id", id);
    fetchAll();
  }

  async function deleteListing(id) {
    if (!confirm("Delete this listing permanently?")) return;
    await supabase.from("jobs").delete().eq("id", id);
    fetchAll();
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Jobs Moderation</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>

        {loading && <p className="text-neutral-400">Loading...</p>}

        <div className="space-y-4">
          {listings.map((item) => (
            <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <h2 className="font-semibold">
                  {item.type === "job" ? "💼" : "🙋"} {item.title}
                </h2>
                <div className="flex gap-2 text-xs">
                  {item.is_hidden && <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">HIDDEN</span>}
                  {item.is_filled && <span className="bg-neutral-700 text-neutral-300 px-2 py-1 rounded">FILLED</span>}
                </div>
              </div>
              <p className="text-sm text-neutral-400 mt-1">{item.description}</p>
              <p className="text-xs text-neutral-500 mt-1">
                By {item.name} · {item.whatsapp} · Flags: {item.flag_count} · {item.category}
              </p>

              <div className="flex gap-3 mt-3 flex-wrap">
                <button
                  onClick={() => toggleHidden(item.id, item.is_hidden)}
                  className="text-sm border border-neutral-700 px-3 py-1.5 rounded-lg hover:border-orange-500"
                >
                  {item.is_hidden ? "Unhide" : "Hide"}
                </button>
                <button
                  onClick={() => toggleFilled(item.id, item.is_filled)}
                  className="text-sm border border-neutral-700 px-3 py-1.5 rounded-lg hover:border-orange-500"
                >
                  {item.is_filled ? "Mark Open" : "Mark Filled"}
                </button>
                <button
                  onClick={() => deleteListing(item.id)}
                  className="text-sm text-red-400 hover:text-red-300 ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && listings.length === 0 && (
          <p className="text-neutral-600 text-center mt-10">No listings yet.</p>
        )}
      </div>
    </main>
  );
}