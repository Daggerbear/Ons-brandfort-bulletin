// src/components/LiveTicker.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function LiveTicker({ lang = "af" }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [postsRes, updatesRes] = await Promise.all([
        supabase
          .from("posts")
          .select("name, created_at")
          .eq("is_hidden", false)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("business_updates")
          .select("title, businesses(name), created_at")
          .eq("Status", "approved")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const postItems = (postsRes.data || []).map((p) => ({
        text: lang === "af" ? `${p.name} het geplaas in Feed` : `${p.name} posted in Feed`,
        created_at: p.created_at,
      }));
      const updateItems = (updatesRes.data || []).map((u) => ({
        text:
          lang === "af"
            ? `${u.businesses?.name || "'n Besigheid"}: ${u.title}`
            : `${u.businesses?.name || "A business"}: ${u.title}`,
        created_at: u.created_at,
      }));

      const combined = [...postItems, ...updateItems]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);

      setItems(combined);
    };
    load();
  }, [lang]);

  if (items.length === 0) return null;

  const loopItems = [...items, ...items];

  return (
    <div className="w-full bg-neutral-950 border-y border-green-500/20 py-2 overflow-hidden">
      <div className="flex items-center gap-3 px-4">
        <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {lang === "af" ? "Lewendig" : "Live"}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="flex gap-10 animate-marquee whitespace-nowrap w-max">
            {loopItems.map((item, i) => (
              <span key={i} className="text-sm text-neutral-400">
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}