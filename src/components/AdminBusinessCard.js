// src/components/AdminBusinessCard.js
"use client";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";
import { CATEGORIES, getCategoryByName } from "@/lib/categories";

const FORM_CATEGORIES = CATEGORIES.filter((c) => c.slug !== "all");

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  const units = [
    { s: 31536000, l: "y" },
    { s: 2592000, l: "mo" },
    { s: 86400, l: "d" },
    { s: 3600, l: "h" },
    { s: 60, l: "m" },
  ];
  for (const u of units) {
    const val = Math.floor(seconds / u.s);
    if (val >= 1) return `${val}${u.l} ago`;
  }
  return "just now";
}

export default function AdminBusinessCard({
  b,
  expanded,
  onToggle,
  menuLive,
  uploading,
  onUpdate,
  onApprove,
  onReject,
  onLogoChange,
}) {
  const isPending = b.Status !== "approved";
  const cat = getCategoryByName(b.category);
  const unknownCategory = b.category && !cat;
  const inputClass = "w-full bg-neutral-800 rounded px-3 py-2 mb-3 text-white";
  const labelClass = "block text-xs text-neutral-500 mb-1";

  return (
    <div
      className={`bg-neutral-900 border rounded-xl overflow-hidden transition ${
        isPending ? "border-orange-500/50" : "border-neutral-800"
      }`}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <SafeImage
            src={b.logo_url}
            alt=""
            width={48}
            height={48}
            className="w-12 h-12 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
            fallback={
              <div className="w-12 h-12 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
            }
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white truncate">{b.name}</p>
            <p
              className={`text-xs truncate ${
                unknownCategory ? "text-red-400" : "text-neutral-500"
              }`}
            >
              {unknownCategory
                ? `⚠️ ${b.category} (not in list)`
                : cat
                ? `${cat.icon} ${cat.name}`
                : "No category"}{" "}
              · {timeAgo(b.created_at)}
            </p>
          </div>
        </button>

        {isPending ? (
          <button
            onClick={onApprove}
            className="bg-green-600 hover:bg-green-700 transition px-3 py-2 rounded-lg text-sm font-semibold flex-shrink-0"
          >
            Approve
          </button>
        ) : (
          <span className="text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 bg-green-600/20 text-green-400">
            Approved
          </span>
        )}
        <button
          onClick={onToggle}
          className="text-neutral-500 text-sm flex-shrink-0 px-1"
          aria-label="Expand"
        >
          {expanded ? "▲" : "▼"}
        </button>
      </div>

      {/* Expanded edit form */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-neutral-800 pt-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                Online menu
              </p>
              <p
                className={`text-sm font-semibold mt-1 ${
                  menuLive ? "text-green-400" : "text-neutral-400"
                }`}
              >
                {menuLive ? "Live" : "Not enabled"}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Link
                href={`/business/${b.id}`}
                target="_blank"
                className="border border-neutral-700 hover:border-orange-500 transition text-neutral-300 rounded-lg px-3 py-2 text-sm font-semibold"
              >
                View page ↗
              </Link>
              <Link
                href={`/admin/businesses/${b.id}/menu`}
                className="bg-orange-500 hover:bg-orange-600 transition text-white rounded-lg px-3 py-2 text-sm font-semibold"
              >
                Manage menu
              </Link>
            </div>
          </div>

          <label className={labelClass}>Logo</label>
          <div className="flex items-center gap-3 mb-3">
            <label className="text-sm bg-neutral-800 hover:bg-neutral-700 transition rounded-lg px-3 py-2 cursor-pointer">
              {uploading ? "Uploading..." : "Change logo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                disabled={uploading}
                onChange={(e) => onLogoChange(e.target.files[0])}
              />
            </label>
          </div>

          <label className={labelClass}>Name</label>
          <input
            defaultValue={b.name}
            onBlur={(e) => onUpdate("name", e.target.value)}
            className={inputClass}
          />

          <label className={labelClass}>Category</label>
          <select
            value={b.category || ""}
            onChange={(e) => onUpdate("category", e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>
              Choose a category...
            </option>
            {unknownCategory && (
              <option value={b.category}>{b.category} (old — please change)</option>
            )}
            {FORM_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>

          <label className={labelClass}>Description</label>
          <textarea
            defaultValue={b.description}
            onBlur={(e) => onUpdate("description", e.target.value)}
            rows={4}
            className={inputClass}
          />

          <label className={labelClass}>Contact</label>
          <input
            defaultValue={b.contact}
            onBlur={(e) => onUpdate("contact", e.target.value)}
            className={inputClass}
          />

          <label className={labelClass}>Website</label>
          <input
            type="url"
            placeholder="https://..."
            defaultValue={b.website}
            onBlur={(e) => onUpdate("website", e.target.value)}
            className={inputClass}
          />

          <label className={labelClass}>Address</label>
          <input
            defaultValue={b.address}
            onBlur={(e) => onUpdate("address", e.target.value)}
            className={inputClass}
          />

          <label className={labelClass}>Hours</label>
          <input
            defaultValue={b.hours}
            onBlur={(e) => onUpdate("hours", e.target.value)}
            className={inputClass}
          />

          <label className={labelClass}>
            Services (comma-separated, e.g. geyser repair, drains, burst pipes)
          </label>
          <input
            defaultValue={b.services?.join(", ") || ""}
            onBlur={(e) =>
              onUpdate(
                "services",
                e.target.value
                  .split(",")
                  .map((s) => s.trim().toLowerCase())
                  .filter(Boolean)
              )
            }
            placeholder="geyser repair, drains, burst pipes"
            className={inputClass}
          />

          <label className={labelClass}>
            Sister group (same value on every business by the same owner, e.g. nana)
          </label>
          <input
            defaultValue={b.sister_group || ""}
            onBlur={(e) => onUpdate("sister_group", e.target.value.trim() || null)}
            placeholder="leave empty if none"
            className="w-full bg-neutral-800 rounded px-3 py-2 mb-4 text-white"
          />

          <div className="flex gap-2">
            {isPending && (
              <button
                onClick={onApprove}
                className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg text-sm font-semibold"
              >
                Approve
              </button>
            )}
            <button
              onClick={onReject}
              className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg text-sm font-semibold"
            >
              {isPending ? "Reject" : "Delete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}