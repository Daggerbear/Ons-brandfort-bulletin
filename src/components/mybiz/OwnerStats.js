// src/components/mybiz/OwnerStats.js
// PAID: a few simple numbers, not a dashboard.
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DAYS = [7, 30];
const CONTACT_EVENTS = ["business_whatsapp", "business_call", "business_directions"];

async function countFor(businessId, since, types) {
  let q = supabase
    .from("analytics_events")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("created_at", since);
  q = Array.isArray(types) ? q.in("event_type", types) : q.eq("event_type", types);
  const { count } = await q;
  return count ?? 0;
}

export default function OwnerStats({ businessId, t }) {
  const [days, setDays] = useState(7);
  const [nums, setNums] = useState(null);

  useEffect(() => {
    let alive = true;
    setNums(null);
    const since = new Date(Date.now() - days * 86400000).toISOString();
    Promise.all([
      countFor(businessId, since, "business_view"),
      countFor(businessId, since, CONTACT_EVENTS),
      countFor(businessId, since, "business_menu_tap"),
      countFor(businessId, since, "menu_order"),
    ]).then(([views, contacts, menu, orders]) => {
      if (alive) setNums({ views, contacts, menu, orders });
    });
    return () => {
      alive = false;
    };
  }, [businessId, days]);

  const cells = [
    ["👀", t.statViews, nums?.views],
    ["💬", t.statContacts, nums?.contacts],
    ["📋", t.statMenu, nums?.menu],
    ["🛒", t.statOrders, nums?.orders],
  ];

  return (
    <div className="mt-4">
      <div className="mb-3 flex gap-2">
        {DAYS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDays(d)}
            className={`rounded-full border px-3 py-1 text-xs ${
              days === d ? "border-orange-500 bg-orange-500 font-bold text-black" : "border-neutral-700 text-neutral-300"
            }`}
          >
            {t.statDays(d)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cells.map(([icon, label, value]) => (
          <div key={label} className="rounded-xl border border-neutral-700 bg-neutral-950 p-3">
            <p className="text-xs text-neutral-400">
              {icon} {label}
            </p>
            <p className="mt-1 text-2xl font-black tabular-nums text-white">{value ?? "–"}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-500">{t.statNote}</p>
    </div>
  );
}
