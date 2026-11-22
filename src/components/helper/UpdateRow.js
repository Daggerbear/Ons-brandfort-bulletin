// src/components/helper/UpdateRow.js
// One business update (special, new stock, announcement) shown inside Lientjie's chat.
import Link from "next/link";

function ago(iso, lang) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return lang === "en" ? "just now" : "nou net";
  const hours = Math.round(mins / 60);
  if (hours < 24) return lang === "en" ? `${hours}h ago` : `${hours} uur gelede`;
  const days = Math.round(hours / 24);
  return lang === "en" ? `${days}d ago` : `${days} d gelede`;
}

export default function UpdateRow({ u, lang, onNavigate }) {
  return (
    <Link
      href={`/business/${u.business_id}`}
      onClick={onNavigate}
      className="block rounded-2xl border border-white/10 border-l-[3px] border-l-orange-500 bg-white/[0.05] px-3 py-2.5 transition hover:border-orange-500/60"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[12px] font-semibold text-orange-300">🔥 {u.businessName}</p>
        <p className="flex-shrink-0 text-[11px] text-neutral-500">{ago(u.created_at, lang)}</p>
      </div>
      <p className="mt-1 text-[14px] font-semibold leading-snug text-white">{u.title}</p>
      {u.body && <p className="mt-0.5 line-clamp-2 text-[13px] text-neutral-400">{u.body}</p>}
    </Link>
  );
}
