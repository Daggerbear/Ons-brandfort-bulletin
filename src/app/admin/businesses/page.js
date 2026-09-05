"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  "Agriculture",
  "Automotive",
  "Beauty & Spa",
  "Food & Dining",
  "Health & Medical",
  "Home Services",
  "Professional Services",
  "Retail & Shopping",
  "Other",
];

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
    await supabase
      .from("businesses")
      .update({ [field]: value })
      .eq("id", id);
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const approveBusiness = async (id) => {
    await supabase
      .from("businesses")
      .update({ Status: "approved" })
      .eq("id", id);
    loadData();
  };

  const rejectBusiness = async (id) => {
    if (!confirm("Delete this business? This cannot be undone.")) return;
    await supabase.from("businesses").delete().eq("id", id);
    loadData();
  };

  const handleLogoChange = async (bizId, file) => {
    if (!file) return;
    setUploadingId(bizId);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("business_logos")
      .upload(fileName, file);

    if (uploadError) {
      alert("Logo upload failed: " + uploadError.message);
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

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/admin"
          className="text-sm text-orange-400 hover:text-orange-300"
        >
          ← Terug na Admin Panel
        </Link>
        <h1 className="text-3xl font-bold mb-2 mt-4">Businesses</h1>
        <p className="text-sm text-neutral-400 mb-6">
          Use <strong className="text-orange-400">Manage menu</strong> on a
          business card to turn online ordering on or off, edit items and
          prices, or set collection and delivery.
        </p>

        <input
          type="text"
          placeholder="Search by name..."
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
          {filteredBusinesses.map((b) => {
            const isExpanded = expandedId === b.id;
            const isPending = b.Status !== "approved";

            return (
              <div
                key={b.id}
                className={`bg-neutral-900 border rounded-xl overflow-hidden transition ${
                  isPending ? "border-orange-500/50" : "border-neutral-800"
                }`}
              >
                {/* Collapsed row — always visible */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : b.id)}
                  className="w-full flex items-center gap-3 p-4 text-left"
                >
                  {b.logo_url ? (
                    <Image
                      src={b.logo_url}
                      alt={`${b.name} logo`}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded-lg border border-neutral-800 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg border border-neutral-800 bg-neutral-800 flex-shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{b.name}</p>
                    <p className="text-xs text-neutral-500">{b.category}</p>
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

                {/* Expanded edit form */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-neutral-800 pt-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-500">
                          Online menu
                        </p>
                        <p
                          className={`text-sm font-semibold mt-1 ${menuStates[b.id] ? "text-green-400" : "text-neutral-400"}`}
                        >
                          {menuStates[b.id] ? "Live" : "Not enabled"}
                        </p>
                      </div>
                      <Link
                        href={`/admin/businesses/${b.id}/menu`}
                        className="shrink-0 bg-orange-500 hover:bg-orange-600 transition text-white rounded-lg px-3 py-2 text-sm font-semibold"
                      >
                        Manage menu
                      </Link>
                    </div>

                    <label className="block text-xs text-neutral-500 mb-1">
                      Logo
                    </label>
                    <div className="flex items-center gap-3 mb-3">
                      <label className="text-sm bg-neutral-800 hover:bg-neutral-700 transition rounded-lg px-3 py-2 cursor-pointer">
                        {uploadingId === b.id ? "Uploading..." : "Change logo"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          disabled={uploadingId === b.id}
                          onChange={(e) => handleLogoChange(b.id, e.target.files[0])}
                        />
                      </label>
                    </div>

                    <label className="block text-xs text-neutral-500 mb-1">
                      Name
                    </label>
                    <input
                      defaultValue={b.name}
                      onBlur={(e) => updateBusiness(b.id, "name", e.target.value)}
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-3 text-white"
                    />

                    <label className="block text-xs text-neutral-500 mb-1">
                      Category
                    </label>
                    <select
                      value={b.category || ""}
                      onChange={(e) => updateBusiness(b.id, "category", e.target.value)}
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
                      Description
                    </label>
                    <textarea
                      defaultValue={b.description}
                      onBlur={(e) =>
                        updateBusiness(b.id, "description", e.target.value)
                      }
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-3 text-white"
                    />

                    <label className="block text-xs text-neutral-500 mb-1">
                      Contact
                    </label>
                    <input
                      defaultValue={b.contact}
                      onBlur={(e) => updateBusiness(b.id, "contact", e.target.value)}
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-3 text-white"
                    />

                    <label className="block text-xs text-neutral-500 mb-1">
                      Website
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      defaultValue={b.website}
                      onBlur={(e) => updateBusiness(b.id, "website", e.target.value)}
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-3 text-white"
                    />

                    <label className="block text-xs text-neutral-500 mb-1">
                      Address
                    </label>
                    <input
                      defaultValue={b.address}
                      onBlur={(e) => updateBusiness(b.id, "address", e.target.value)}
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-3 text-white"
                    />

                    <label className="block text-xs text-neutral-500 mb-1">
                      Hours
                    </label>
                    <input
                      defaultValue={b.hours}
                      onBlur={(e) => updateBusiness(b.id, "hours", e.target.value)}
                      className="w-full bg-neutral-800 rounded px-3 py-2 mb-4 text-white"
                    />

                    <div className="flex gap-2">
                      {isPending && (
                        <button
                          onClick={() => approveBusiness(b.id)}
                          className="bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => rejectBusiness(b.id)}
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