"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminAnalytics() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [businessMap, setBusinessMap] = useState({});

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const loadData = async () => {
      setLoading(true);
      const [eventsResult, businessesResult] = await Promise.all([
        supabase
          .from("analytics_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5000),
        supabase.from("businesses").select("id, name"),
      ]);

      setEvents(eventsResult.data || []);

      const map = {};
      (businessesResult.data || []).forEach((b) => {
        map[b.id] = b.name;
      });
      setBusinessMap(map);
      setLoading(false);
    };
    loadData();
  }, [authenticated]);

  if (!checked) return null;

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <p className="text-neutral-400">
          Please{" "}
          <Link href="/admin" className="text-orange-400">
            log in
          </Link>{" "}
          first.
        </p>
      </main>
    );
  }

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const last30 = events.filter((e) => new Date(e.created_at).getTime() >= thirtyDaysAgo);

  const countBy = (list, type) => list.filter((e) => e.event_type === type).length;

  const pageViewsAll = countBy(events, "page_view");
  const pageViews30 = countBy(last30, "page_view");
  const searchesAll = countBy(events, "search");
  const searches30 = countBy(last30, "search");
  const businessViewsAll = countBy(events, "business_view");
  const businessViews30 = countBy(last30, "business_view");

  const topBusinesses = (() => {
    const counts = {};
    events
      .filter((e) => e.event_type === "business_view" && e.business_id)
      .forEach((e) => {
        counts[e.business_id] = (counts[e.business_id] || 0) + 1;
      });
    return Object.entries(counts)
      .map(([id, count]) => ({ id, name: businessMap[id] || `#${id}`, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  })();

  const topSearches = (() => {
    const counts = {};
    events
      .filter((e) => e.event_type === "search" && e.query)
      .forEach((e) => {
        const q = e.query.trim().toLowerCase();
        counts[q] = (counts[q] || 0) + 1;
      });
    return Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  })();

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-sm text-orange-400 hover:text-orange-300">
          ← Terug na Admin Panel
        </Link>
        <h1 className="text-3xl font-bold mb-2 mt-4">📊 Analytics</h1>
        <p className="text-sm text-neutral-400 mb-8">
          Traffic and demand data — screenshot this page for sales conversations.
        </p>

        {loading ? (
          <p className="text-neutral-400">Loading...</p>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-neutral-900 border border-orange-500/30 rounded-2xl p-4" style={{ boxShadow: "0 0 20px rgba(249,115,22,0.08)" }}>
                <p className="text-2xl font-black text-orange-500 tabular-nums">{pageViewsAll}</p>
                <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">Site Visits</p>
                <p className="text-xs text-neutral-600 mt-0.5">{pageViews30} last 30 days</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <p className="text-2xl font-black text-white tabular-nums">{businessViewsAll}</p>
                <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">Business Views</p>
                <p className="text-xs text-neutral-600 mt-0.5">{businessViews30} last 30 days</p>
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                <p className="text-2xl font-black text-white tabular-nums">{searchesAll}</p>
                <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wide">Vind Searches</p>
                <p className="text-xs text-neutral-600 mt-0.5">{searches30} last 30 days</p>
              </div>
            </div>

            {/* Top businesses */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-3">🏆 Most Viewed Businesses</h2>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
                {topBusinesses.length === 0 && (
                  <p className="text-neutral-500 text-sm px-5 py-6">No views tracked yet.</p>
                )}
                {topBusinesses.map((b, i) => (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between gap-3 px-5 py-3 ${
                      i !== topBusinesses.length - 1 ? "border-b border-neutral-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-neutral-600 text-sm font-mono w-5">{i + 1}</span>
                      <span className="font-semibold text-orange-400 truncate">{b.name}</span>
                    </div>
                    <span className="text-white font-bold tabular-nums flex-shrink-0">{b.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top searches */}
            <div>
              <h2 className="text-lg font-bold mb-3">🔎 Top "Vind 'n Diens" Searches</h2>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden">
                {topSearches.length === 0 && (
                  <p className="text-neutral-500 text-sm px-5 py-6">No searches tracked yet.</p>
                )}
                {topSearches.map((s, i) => (
                  <div
                    key={s.query}
                    className={`flex items-center justify-between gap-3 px-5 py-3 ${
                      i !== topSearches.length - 1 ? "border-b border-neutral-800" : ""
                    }`}
                  >
                    <span className="text-neutral-300 truncate">"{s.query}"</span>
                    <span className="text-white font-bold tabular-nums flex-shrink-0">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}