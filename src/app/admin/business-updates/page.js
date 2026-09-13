// app/admin/business-updates/page.js
"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = ["Special", "New Stock", "Menu", "Offer", "Announcement"];
const MAX_PINNED = 7;

export default function AdminBusinessUpdates() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("pending");
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem("adminAuth") === "true") {
      setAuthenticated(true);
    }
    setChecked(true);
  }, []);

  const loadData = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("business_updates")
      .select("*, businesses(id, name, logo_url, contact)")
      .order("created_at", { ascending: false });

    setUpdates(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const updateField = async (id, field, value) => {
    await supabase
      .from("business_updates")
      .update({ [field]: value })
      .eq("id", id);
    setUpdates((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  const approveUpdate = async (id) => {
    await supabase
      .from("business_updates")
      .update({ Status: "approved" })
      .eq("id", id);
    loadData();
  };

  const rejectUpdate = async (id) => {
    if (!confirm("Delete this update? This cannot be undone.")) return;
    await supabase.from("business_updates").delete().eq("id", id);
    loadData();
  };

  const handleImageChange = async (updateId, file) => {
    if (!file) return;
    setUploadingId(updateId);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("business_update_images")
      .upload(fileName, file);

    if (uploadError) {
      alert("Image upload failed: " + uploadError.message);
      setUploadingId(null);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("business_update_images")
      .getPublicUrl(fileName);

    await updateField(updateId, "image_url", publicUrlData.publicUrl);
    setUploadingId(null);
  };

  const pinnedCount = useMemo(
    () => updates.filter((u) => u.is_pinned).length,
    [updates]
  );

  const togglePin = async (id, currentlyPinned) => {
    if (!currentlyPinned && pinnedCount >= MAX_PINNED) {
      alert(
        `Maximum of ${MAX_PINNED} pinned updates reached. Unpin one first to free up a slot.`
      );
      return;
    }

    await supabase
      .from("business_updates")
      .update({
        is_pinned: !currentlyPinned,
        pinned_at: !currentlyPinned ? new Date().toISOString() : null,
      })
      .eq("id", id);
    loadData();
  };

  const pendingCount = useMemo(
    () => updates.filter((u) => u.Status !== "approved").length,
    [updates]
  );
  const approvedCount = useMemo(
    () => updates.filter((u) => u.Status === "approved").length,
    [updates]
  );

  const filteredUpdates = useMemo(() => {
    let list = updates;
    if (filter === "pending") list = list.filter((u) => u.Status !== "approved");
    if (filter === "approved") list = list.filter((u) => u.Status === "approved");
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (u) =>
          u.title?.toLowerCase().includes(q) ||
          u.businesses?.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [updates, filter, searchTerm]);

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

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin"
          className="text-sm text-orange-400 hover:text-orange-300"
        >
          ← Terug na Admin Panel
        </Link>
        <h1 className="text-3xl font-bold mb-2 mt-4">Business Updates</h1>
        <p className="text-sm text-neutral-400 mb-1">
          Check that <strong className="text-orange-400">Contact given</strong>{" "}
          roughly matches <strong className="text-orange-400">Business contact on file</strong>{" "}
          before approving.
        </p>
        <p className="text-sm text-yellow-400 mb-6">
          👑 Pinned slots used: {pinnedCount} / {MAX_PINNED}
        </p>

        <input
          type="text"
          placeholder="Search by title or business name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 mb-3 text-white placeholder-neutral-500 focus:border-orange-500 outline-none"
        />

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("pending")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "pending"
                ? "bg-orange-500 text-black"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400"
            }`}
          >
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "approved"
                ? "bg-orange-500 text-black"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400"
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
              filter === "all"
                ? "bg-orange-500 text-black"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400"
            }`}
          >
            All ({updates.length})
          </button>
        </div>

        {loading && <p className="text-neutral-400">Loading...</p>}
        {!loading && filteredUpdates.length === 0 && (
          <p className="text-neutral-500 text-sm text-center py-8">
            No updates match.
          </p>
        )}

        <div className="space-y-3">
          {filteredUpdates.map((u) => {
            const isExpanded = expandedId === u.id;
            const isPending = u.Status !== "approved";
            const biz = u.businesses;
            const contactMatches =
              biz?.contact &&
              u.contact_number &&
              biz.contact.replace(/\D/g, "").slice(-9) ===
                u.contact_number.replace(/\D/g, "").slice(-9);

            return (
              <div
                key={u.id}
                className={`bg-neutral-900 border rounded-xl overflow-hidden transition ${
                  u.is_pinned
                    ? "border-yellow-500/60"
                    : isPending
                    ? "border-orange-500/50"
                    : "border-neutral-800"
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : u.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  {biz?.logo_url ? (
                    <Image
                      src={biz.logo_url}
                      alt={biz.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate flex items-center gap-1">
                      {u.is_pinned && <span>👑</span>}
                      {u.title}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">
                      {biz?.name} · {u.category}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-semibold flex-shrink-0 ${
                      isPending
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-green-600/20 text-green-400"
                    }`}
                  >
                    {isPending ? "Pending" : "Approved"}
                  </span>
                  <span className="text-neutral-500 text-sm flex-shrink-0">
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-neutral-800 pt-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-neutral-800 rounded-lg p-3">
                        <p className="text-xs text-neutral-500 mb-1">
                          Contact given
                        </p>
                        <p className="text-sm text-white">
                          {u.contact_number || "—"}
                        </p>
                      </div>
                      <div
                        className={`rounded-lg p-3 ${
                          contactMatches
                            ? "bg-green-900/30"
                            : "bg-neutral-800"
                        }`}
                      >
                        <p className="text-xs text-neutral-500 mb-1">
                          Business contact on file
                        </p>
                        <p className="text-sm text-white">
                          {biz?.contact || "—"}
                        </p>
                      </div>
                    </div>
                    {!contactMatches && (
                      <p className="text-xs text-orange-400 mb-4">
                        ⚠️ Numbers don't clearly match — verify manually before approving.
                      </p>
                    )}

                    <label className="block text-xs text-neutral-500 mb-1">
                      Title
                    </label>
                    <input
                      defaultValue={u.title}
                      onBlur={(e) => updateField(u.id, "title", e.target.value)}
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-3 text-white"
                    />

                    <label className="block text-xs text-neutral-500 mb-1">
                      Category
                    </label>
                    <select
                      value={u.category || ""}
                      onChange={(e) => updateField(u.id, "category", e.target.value)}
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-3 text-white"
                    >
                      <option value="" disabled>
                        Choose a category...
                      </option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <label className="block text-xs text-neutral-500 mb-1">
                      Body
                    </label>
                    <textarea
                      defaultValue={u.body}
                      onBlur={(e) => updateField(u.id, "body", e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-4 text-white"
                    />

                    <label className="block text-xs text-neutral-500 mb-1">
                      Image
                    </label>
                    {u.image_url && (
                      <Image
                        src={u.image_url}
                        alt={u.title}
                        width={200}
                        height={120}
                        className="rounded-lg border border-neutral-800 mb-2 object-contain bg-neutral-950"
                      />
                    )}
                    <label className="inline-block text-sm bg-neutral-800 hover:bg-neutral-700 transition rounded-lg px-3 py-2 cursor-pointer mb-4">
                      {uploadingId === u.id
                        ? "Uploading..."
                        : u.image_url
                        ? "Change image"
                        : "Add image"}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        disabled={uploadingId === u.id}
                        onChange={(e) => handleImageChange(u.id, e.target.files[0])}
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {isPending && (
                        <button
                          onClick={() => approveUpdate(u.id)}
                          className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      {!isPending && (
                        <button
                          onClick={() => togglePin(u.id, u.is_pinned)}
                          className={`transition px-4 py-2 rounded-lg text-sm font-semibold ${
                            u.is_pinned
                              ? "bg-yellow-600 hover:bg-yellow-700 text-black"
                              : "bg-neutral-800 hover:bg-neutral-700 border border-yellow-600/50 text-yellow-400"
                          }`}
                        >
                          {u.is_pinned ? "👑 Unpin" : "👑 Pin (R100/mo)"}
                        </button>
                      )}
                      <button
                        onClick={() => rejectUpdate(u.id)}
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
    </main>
  );
}