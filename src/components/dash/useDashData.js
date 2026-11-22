// src/components/dash/useDashData.js
// The numbers behind the dashboard: counts, a daily chart and the live feed.
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DAY = 86400000;
export const METRICS = {
  views: ["business_view"],
  contacts: ["business_whatsapp", "business_call", "business_directions"],
  orders: ["menu_order", "menu_enquiry"],
  scans: ["qr_scan"],
};
const FEED_TYPES = [
  "business_view",
  "business_share",
  "business_whatsapp",
  "business_call",
  "business_directions",
  "business_website",
  "business_menu_tap",
  "menu_order",
  "menu_enquiry",
  "qr_scan",
];

const dayKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

async function countFor(businessId, types, from, to) {
  const { count } = await supabase
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .in("event_type", types)
    .gte("created_at", from)
    .lt("created_at", to);
  return count ?? 0;
}

async function loadFeed(businessId) {
  const { data } = await supabase
    .from("analytics_events")
    .select("id, event_type, created_at")
    .eq("business_id", businessId)
    .in("event_type", FEED_TYPES)
    .order("created_at", { ascending: false })
    .limit(12);
  return data || [];
}

export default function useDashData(businessId, days) {
  const [state, setState] = useState({ loading: true, cur: null, prev: null, series: [], feed: [] });

  useEffect(() => {
    let alive = true;
    const now = Date.now();
    const iso = (ms) => new Date(ms).toISOString();
    const from = iso(now - days * DAY);
    const prevFrom = iso(now - 2 * days * DAY);
    const upTo = iso(now + 60000);

    setState((s) => ({ ...s, loading: true }));

    (async () => {
      const keys = Object.keys(METRICS);
      const [curCounts, prevCounts, viewRows, feed] = await Promise.all([
        Promise.all(keys.map((k) => countFor(businessId, METRICS[k], from, upTo))),
        Promise.all(keys.map((k) => countFor(businessId, METRICS[k], prevFrom, from))),
        supabase
          .from("analytics_events")
          .select("created_at")
          .eq("business_id", businessId)
          .eq("event_type", "business_view")
          .gte("created_at", from)
          .order("created_at", { ascending: true })
          .limit(1000),
        loadFeed(businessId),
      ]);
      if (!alive) return;

      const perDay = {};
      (viewRows.data || []).forEach((r) => {
        const k = dayKey(new Date(r.created_at));
        perDay[k] = (perDay[k] || 0) + 1;
      });
      const series = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now - i * DAY);
        series.push({ x: `${d.getDate()}/${d.getMonth() + 1}`, y: perDay[dayKey(d)] || 0 });
      }

      setState({
        loading: false,
        cur: Object.fromEntries(keys.map((k, i) => [k, curCounts[i]])),
        prev: Object.fromEntries(keys.map((k, i) => [k, prevCounts[i]])),
        series,
        feed,
      });
    })();

    // keep the feed fresh while the dashboard is open
    const timer = setInterval(async () => {
      const feed = await loadFeed(businessId);
      if (alive) setState((s) => ({ ...s, feed }));
    }, 30000);

    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [businessId, days]);

  return state;
}
