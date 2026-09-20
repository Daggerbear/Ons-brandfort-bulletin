// src/app/admin/events/page.js
"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import SafeImage from "@/components/SafeImage";

// Handles both "2026-10-17" and "17-10-2026"
function parseDate(str) {
  if (!str) return null;
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let d = null;
  if (m) d = new Date(+m[1], +m[2] - 1, +m[3]);
  else {
    m = str.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (m) d = new Date(+m[3], +m[2] - 1, +m[1]);
  }
  return d && !isNaN(d.getTime()) ? d : null;
}

// "17-10-2026" -> "2026-10-17"; anything else is left as typed
function normalizeDate(str) {
  const trimmed = (str || "").trim();
  const m = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : trimmed;
}

function daysUntil(str) {
  const d = parseDate(str);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

// Resize to max 1400px wide and save as a light JPEG.
async function compressPhoto(file, maxWidth = 1400, quality = 0.8) {
  try {
    if (!file.type.startsWith("image/")) return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );
    if (!blob || blob.size >= file.size) return file;
    return blob;
  } catch {
    return file;
  }
}

export default function AdminEvents() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [toast, setToast] = useState(null);

  const notify = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const updateEvent = async (id, field, value) => {
    const { error } = await supabase
      .from("events")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      console.log("Update error:", error);
      notify(`Save failed: ${error.message}`, false);
      return false;
    }

    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, [field]: value } : ev))
    );
    notify("Saved ✓");
    return true;
  };

  const approveEvent = async (id) => {
    const { error } = await supabase
      .from("events")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      notify(`Approve failed: ${error.message}`, false);
      return;
    }
    notify("Approved ✓");
    loadData();
  };

  const rejectEvent = async (ev) => {
    if (!confirm(`Delete "${ev.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("events").delete().eq("id", ev.id);

    if (error) {
      notify(`Delete failed: ${error.message}`, false);
      return;
    }
    notify("Deleted");
    loadData();
  };

  const handlePhotoChange = async (eventId, file) => {
    if (!file) return;
    setUploadingId(eventId);

    const uploadFile = await compressPhoto(file);
    const compressed = uploadFile !== file;
    const fileExt = compressed ? "jpg" : file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("events-photos")
      .upload(
        fileName,
        uploadFile,
        compressed ? { contentType: "image/jpeg" } : undefined
      );

    if (uploadError) {
      notify(`Photo upload failed: ${uploadError.message}`, false);
      setUploadingId(null);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("events-photos")
      .getPublicUrl(fileName);

    await updateEvent(eventId, "image_url", publicUrlData.publicUrl);
    setUploadingId(null);
  };

  const pendingCount = useMemo(
    () => events.filter((ev) => ev.status !== "approved").length,
    [events]
  );
  const approvedCount = useMemo(
    () => events.filter((ev) => ev.status === "approved").length,
    [events]
  );

  const visible = useMemo(() => {
    let list = events;
    if (filter === "pending") list = list.filter((ev) => ev.status !== "approved");
    if (filter === "approved") list = list.filter((ev) => ev.status === "approved");
    // Pending first when showing everything
    return [...list].sort(
      (a, b) =>
        Number(b.status !== "approved") - Number(a.status !== "approved")
    );
  }, [events, filter]);

  if (!checked) return null;

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <p className="text-neutral-400">
          Please <Link href="/admin" className="text-orange-400">log in</Link> first.
        </p>
      </main>
    );
  }

  const tabClass = (name) =>
    `flex-1 py-2 rounded-lg text-sm font-semibold transition ${
      filter === name
        ? "bg-orange-500 text-black"
        : "bg-neutral-900 border border-neutral-800 text-neutral-400"
    }`;
  const inputClass = "w-full bg-neutral-800 rounded px-3 py-2 mb-3 text-white";
  const labelClass = "block text-xs text-neutral-500 mb-1";

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-sm text-orange-400 hover:text-orange-300">
          ← Terug na Admin Panel
        </Link>
        <h1 className="text-3xl font-bold mb-6 mt-4">Events</h1>

        <div className="flex gap-2 mb-6">
          <button onClick={() => setFilter("pending")} className={tabClass("pending")}>
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button onClick={() => setFilter("approved")} className={tabClass("approved")}>
            Approved ({approvedCount})
          </button>
          <button onClick={() => setFilter("all")} className={tabClass("all")}>
            All ({events.length})
          </button>
        </div>

        {loading && <p className="text-neutral-400">Loading...</p>}
        {!loading && visible.length === 0 && (
          <p className="text-neutral-500 text-sm text-center py-8">No events here.</p>
        )}

        <div className="space-y-3">
          {visible.map((ev) => {
            const isPending = ev.status !== "approved";
            const isExpanded = expandedId === ev.id;
            const days = daysUntil(ev.date);
            let when = null;
            if (days !== null) {
              if (days < 0) when = { label: "Past", past: true };
              else if (days === 0) when = { label: "Today" };
              else when = { label: `in ${days}d` };
            }

            return (
              <div
                key={ev.id}
                className={`bg-neutral-900 border rounded-xl overflow-hidden ${
                  isPending ? "border-orange-500/50" : "border-neutral-800"
                }`}
              >
                {/* Collapsed row */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <SafeImage
                      src={ev.image_url}
                      alt=""
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                      fallback={
                        <div className="w-12 h-12 rounded-lg border border-neutral-800 bg-neutral-800 flex items-center justify-center text-lg flex-shrink-0">
                          📅
                        </div>
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate">{ev.title}</p>
                      <p className="text-xs text-neutral-500 truncate">
                        {ev.date}
                        {when && (
                          <span
                            className={`ml-2 ${when.past ? "text-red-400" : "text-green-400"}`}
                          >
                            {when.label}
                          </span>
                        )}
                      </p>
                    </div>
                  </button>

                  {isPending ? (
                    <button
                      onClick={() => approveEvent(ev.id)}
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
                    onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                    className="text-neutral-500 text-sm flex-shrink-0 px-1"
                    aria-label="Expand"
                  >
                    {isExpanded ? "▲" : "▼"}
                  </button>
                </div>

                {/* Expanded edit form */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-neutral-800 pt-4">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <p className="text-xs text-neutral-500 min-w-0 truncate">
                        Submitted by {ev.submittedBy || "—"}
                      </p>
                      <Link
                        href={`/events/${ev.id}`}
                        target="_blank"
                        className="border border-neutral-700 hover:border-orange-500 transition text-neutral-300 rounded-lg px-3 py-2 text-sm font-semibold flex-shrink-0"
                      >
                        View page ↗
                      </Link>
                    </div>

                    <label className={labelClass}>Photo</label>
                    <div className="flex items-center gap-3 mb-3">
                      <label className="text-sm bg-neutral-800 hover:bg-neutral-700 transition rounded-lg px-3 py-2 cursor-pointer">
                        {uploadingId === ev.id ? "Uploading..." : "Change photo"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          disabled={uploadingId === ev.id}
                          onChange={(e) => handlePhotoChange(ev.id, e.target.files[0])}
                        />
                      </label>
                    </div>

                    <label className={labelClass}>Title</label>
                    <input
                      defaultValue={ev.title}
                      onBlur={(e) => updateEvent(ev.id, "title", e.target.value)}
                      className={inputClass}
                    />

                    <label className={labelClass}>Date (YYYY-MM-DD, e.g. 2026-10-17)</label>
                    <input
                      defaultValue={ev.date}
                      onBlur={(e) => {
                        const fixed = normalizeDate(e.target.value);
                        e.target.value = fixed;
                        updateEvent(ev.id, "date", fixed);
                      }}
                      className={inputClass}
                    />

                    <label className={labelClass}>Time</label>
                    <input
                      defaultValue={ev.time}
                      onBlur={(e) => updateEvent(ev.id, "time", e.target.value)}
                      className={inputClass}
                    />

                    <label className={labelClass}>Location</label>
                    <input
                      defaultValue={ev.location}
                      onBlur={(e) => updateEvent(ev.id, "location", e.target.value)}
                      className={inputClass}
                    />

                    <label className={labelClass}>Description</label>
                    <textarea
                      defaultValue={ev.description}
                      onBlur={(e) => updateEvent(ev.id, "description", e.target.value)}
                      rows={4}
                      className={inputClass}
                    />

                    <label className={labelClass}>WhatsApp Number</label>
                    <input
                      defaultValue={ev.whatsapp}
                      onBlur={(e) => updateEvent(ev.id, "whatsapp", e.target.value)}
                      placeholder="e.g. 0821234567"
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-4 text-white"
                    />

                    <div className="flex gap-2">
                      {isPending && (
                        <button
                          onClick={() => approveEvent(ev.id)}
                          className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => rejectEvent(ev)}
                        className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        {isPending ? "Reject" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-sm rounded-xl border px-4 py-3 text-sm text-center shadow-lg ${
            toast.ok
              ? "bg-neutral-900 border-green-500/50 text-green-300"
              : "bg-red-950 border-red-500/60 text-red-300"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </main>
  );
}