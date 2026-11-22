// src/components/dash/ActivityFeed.js
import { Glass, SectionLabel } from "./dashUi";

const ICONS = {
  business_view: "👀",
  business_share: "📤",
  business_whatsapp: "💬",
  business_call: "📞",
  business_directions: "📍",
  business_website: "🌐",
  business_menu_tap: "📋",
  menu_order: "🛒",
  menu_enquiry: "✉️",
  qr_scan: "🔳",
};

export function timeAgo(iso, ago) {
  const secs = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return ago.now;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} ${ago.min}`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} ${ago.hour}`;
  return `${Math.round(hours / 24)} ${ago.day}`;
}

export default function ActivityFeed({ feed, d }) {
  return (
    <Glass className="p-4">
      <SectionLabel>{d.feedTitle}</SectionLabel>
      {feed.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--bz-muted)" }}>
          {d.feedEmpty}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {feed.map((e) => (
            <li key={e.id} className="flex items-center gap-3">
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base"
                style={{ background: "var(--bz-accent-soft)", border: "1px solid var(--bz-accent-line)" }}
              >
                {ICONS[e.event_type] || "•"}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{d.ev[e.event_type] || e.event_type}</span>
              <span className="flex-shrink-0 text-xs" style={{ color: "var(--bz-muted)" }}>
                {timeAgo(e.created_at, d.ago)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Glass>
  );
}
