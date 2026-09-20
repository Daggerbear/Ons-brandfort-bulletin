// src/app/admin/businesses/page.js
"use client";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AdminBusinessCard from "@/components/AdminBusinessCard";
import { getCategoryByName } from "@/lib/categories";

const EXT_BY_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Shrink logos to max 512px. Keeps PNG/WEBP transparency.
async function compressLogo(file, maxSize = 512, quality = 0.85) {
  try {
    if (!file.type.startsWith("image/")) return file;
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const outType = EXT_BY_TYPE[file.type] ? file.type : "image/jpeg";
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, outType, quality)
    );
    if (!blob || blob.size >= file.size) return file;
    return blob;
  } catch {
    return file;
  }
}

export default function AdminBusinesses() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [menuStates, setMenuStates] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

    const [businessesResult, menuSettingsResult] = await Promise.all([
      supabase
        .from("businesses")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("business_menu_settings")
        .select("business_id, menu_enabled"),
    ]);

    setBusinesses(businessesResult.data || []);

    const nextMenuStates = {};
    (menuSettingsResult.data || []).forEach((setting) => {
      nextMenuStates[setting.business_id] = setting.menu_enabled;
    });
    setMenuStates(nextMenuStates);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const updateBusiness = async (id, field, value) => {
    const { error } = await supabase
      .from("businesses")
      .update({ [field]: value })
      .eq("id", id);

    if (error) {
      console.log("Update error:", error);
      notify(`Save failed: ${error.message}`, false);
      return false;
    }

    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
    notify("Saved ✓");
    return true;
  };

  const approveBusiness = async (id) => {
    const { error } = await supabase
      .from("businesses")
      .update({ Status: "approved" })
      .eq("id", id);

    if (error) {
      notify(`Approve failed: ${error.message}`, false);
      return;
    }
    notify("Approved ✓");
    loadData();
  };

  const rejectBusiness = async (id) => {
    if (!confirm("Delete this business? This cannot be undone.")) return;
    const { error } = await supabase.from("businesses").delete().eq("id", id);

    if (error) {
      notify(`Delete failed: ${error.message}`, false);
      return;
    }
    notify("Deleted");
    loadData();
  };

  const handleLogoChange = async (bizId, file) => {
    if (!file) return;
    setUploadingId(bizId);

    const uploadFile = await compressLogo(file);
    const contentType = uploadFile.type || file.type;
    const fileExt = EXT_BY_TYPE[contentType] || file.name.split(".").pop() || "png";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("business_logos")
      .upload(fileName, uploadFile, { contentType });

    if (uploadError) {
      notify(`Logo upload failed: ${uploadError.message}`, false);
      setUploadingId(null);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("business_logos")
      .getPublicUrl(fileName);

    await updateBusiness(bizId, "logo_url", publicUrlData.publicUrl);
    setUploadingId(null);
  };

  const pendingCount = useMemo(
    () => businesses.filter((b) => b.Status !== "approved").length,
    [businesses]
  );
  const approvedCount = useMemo(
    () => businesses.filter((b) => b.Status === "approved").length,
    [businesses]
  );
  const unknownCategoryCount = useMemo(
    () => businesses.filter((b) => b.category && !getCategoryByName(b.category)).length,
    [businesses]
  );

  const filteredBusinesses = useMemo(() => {
    let list = businesses;
    if (filter === "pending") list = list.filter((b) => b.Status !== "approved");
    if (filter === "approved") list = list.filter((b) => b.Status === "approved");
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((b) => b.name?.toLowerCase().includes(q));
    }
    return list;
  }, [businesses, filter, searchTerm]);

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

  const tabClass = (name) =>
    `flex-1 py-2 rounded-lg text-sm font-semibold transition ${
      filter === name
        ? "bg-orange-500 text-black"
        : "bg-neutral-900 border border-neutral-800 text-neutral-400"
    }`;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-sm text-orange-400 hover:text-orange-300">
          ← Terug na Admin Panel
        </Link>
        <h1 className="text-3xl font-bold mb-2 mt-4">Businesses</h1>
        <p className="text-sm text-neutral-400 mb-6">
          Use <strong className="text-orange-400">Manage menu</strong> on a
          business card to turn online ordering on or off, edit items and
          prices, or set collection and delivery.
        </p>

        {unknownCategoryCount > 0 && (
          <div className="bg-red-950/60 border border-red-500/50 text-red-300 text-sm rounded-lg px-4 py-3 mb-4">
            ⚠️ {unknownCategoryCount} business
            {unknownCategoryCount === 1 ? " has" : "es have"} a category that
            isn't in the current list. Look for the red text and pick a new
            category.
          </div>
        )}

        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 mb-3 text-white placeholder-neutral-500 focus:border-orange-500 outline-none"
        />

        <div className="flex gap-2 mb-6">
          <button onClick={() => setFilter("pending")} className={tabClass("pending")}>
            Pending {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button onClick={() => setFilter("approved")} className={tabClass("approved")}>
            Approved ({approvedCount})
          </button>
          <button onClick={() => setFilter("all")} className={tabClass("all")}>
            All ({businesses.length})
          </button>
        </div>

        {loading && <p className="text-neutral-400">Loading...</p>}
        {!loading && filteredBusinesses.length === 0 && (
          <p className="text-neutral-500 text-sm text-center py-8">
            No businesses match.
          </p>
        )}

        <div className="space-y-3">
          {filteredBusinesses.map((b) => (
            <AdminBusinessCard
              key={b.id}
              b={b}
              expanded={expandedId === b.id}
              onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
              menuLive={!!menuStates[b.id]}
              uploading={uploadingId === b.id}
              onUpdate={(field, value) => updateBusiness(b.id, field, value)}
              onApprove={() => approveBusiness(b.id)}
              onReject={() => rejectBusiness(b.id)}
              onLogoChange={(file) => handleLogoChange(b.id, file)}
            />
          ))}
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