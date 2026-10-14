// src/app/admin/housing/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminHousing() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    const { data, error } = await supabase
      .from("housing")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setListings(data);
    setLoading(false);
  }

  async function toggleHidden(id, current) {
    await supabase.from("housing").update({ is_hidden: !current }).eq("id", id);
    fetchAll();
  }

  async function toggleTaken(id, current) {
    await supabase.from("housing").update({ is_taken: !current }).eq("id", id);
    fetchAll();
  }

  async function resetFlags(id) {
    await supabase.from("housing").update({ flag_count: 0 }).eq("id", id);
    fetchAll();
  }

  async function deleteListing(id) {
    if (!confirm("Delete this listing permanently?")) return;
    await supabase.from("housing").delete().eq("id", id);
    fetchAll();
  }

  function priceLabel(item) {
    if (item.price_on_request) return "Price on request";
    if (item.price) {
      const base = `R${Number(item.price).toLocaleString("en-ZA")}`;
      return item.listing_type === "rent" ? `${base}/month` : base;
    }
    return "No price";
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Housing Moderation</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>

        {loading && <p className="text-neutral-400">Loading...</p>}

        <div className="space-y-4">
          {listings.map((item) => (
            <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <div className="flex justify-between items-start gap-3">
                <h2 className="font-semibold break-words min-w-0">{item.title}</h2>
                <div className="flex gap-2 text-xs flex-shrink-0">
                  {item.is_hidden && (
                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">HIDDEN</span>
                  )}
                  {item.is_taken && (
                    <span className="bg-neutral-700 text-neutral-300 px-2 py-1 rounded">
                      {item.listing_type === "sale" ? "SOLD" : "RENTED"}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-neutral-400 mt-1 whitespace-pre-line break-words">
                {item.description}
              </p>

              <p className="text-xs text-neutral-500 mt-2">
                {item.listing_type === "sale" ? "For Sale" : "To Rent"} · {item.property_type} ·{" "}
                {priceLabel(item)}
                {item.area ? ` · ${item.area}` : ""}
                {item.bedrooms !== null && item.bedrooms !== undefined ? ` · ${item.bedrooms} bed` : ""}
                {item.bathrooms !== null && item.bathrooms !== undefined ? ` · ${item.bathrooms} bath` : ""}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                By {item.name} · {item.whatsapp} · Flags: {item.flag_count}
              </p>

              {item.image_url && (
                <a
                  href={item.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-orange-400 underline mt-1 inline-block"
                >
                  View photo ↗
                </a>
              )}

              <div className="flex gap-3 mt-3 flex-wrap items-center">
                <button
                  onClick={() => toggleHidden(item.id, item.is_hidden)}
                  className="text-sm border border-neutral-700 px-3 py-1.5 rounded-lg hover:border-orange-500"
                >
                  {item.is_hidden ? "Unhide" : "Hide"}
                </button>
                <button
                  onClick={() => toggleTaken(item.id, item.is_taken)}
                  className="text-sm border border-neutral-700 px-3 py-1.5 rounded-lg hover:border-orange-500"
                >
                  {item.is_taken
                    ? item.listing_type === "sale"
                      ? "Mark Unsold"
                      : "Mark Available"
                    : item.listing_type === "sale"
                    ? "Mark Sold"
                    : "Mark Rented"}
                </button>
                {item.flag_count > 0 && (
                  <button
                    onClick={() => resetFlags(item.id)}
                    className="text-sm border border-neutral-700 px-3 py-1.5 rounded-lg hover:border-orange-500"
                  >
                    Clear Flags
                  </button>
                )}
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
