"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminBusinesses() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
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
      .from("businesses")
      .select("*")
      .order("created_at", { ascending: false });
    setBusinesses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const updateBusiness = async (id, field, value) => {
    await supabase.from("businesses").update({ [field]: value }).eq("id", id);
  };

  const approveBusiness = async (id) => {
    await supabase.from("businesses").update({ Status: "approved" }).eq("id", id);
    loadData();
  };

  const rejectBusiness = async (id) => {
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
    loadData();
  };

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

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/admin" className="text-sm text-orange-400 hover:text-orange-300">
          ← Terug na Admin Panel
        </Link>
        <h1 className="text-3xl font-bold mb-8 mt-4">Businesses</h1>

        {loading && <p className="text-neutral-400">Loading...</p>}

        <div className="space-y-4">
          {businesses.map((b) => (
            <div key={b.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <label className="block text-xs text-neutral-500 mb-1">Logo</label>
              <div className="flex items-center gap-3 mb-2">
                {b.logo_url ? (
                  <img
                    src={b.logo_url}
                    alt={`${b.name} logo`}
                    className="w-16 h-16 object-cover rounded-lg border border-neutral-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-neutral-800 bg-neutral-800 flex items-center justify-center text-xs text-neutral-500">
                    No logo
                  </div>
                )}
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

              <label className="block text-xs text-neutral-500 mb-1">Name</label>
              <input
                defaultValue={b.name}
                onBlur={(e) => updateBusiness(b.id, "name", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">Category</label>
              <input
                defaultValue={b.category}
                onBlur={(e) => updateBusiness(b.id, "category", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">Description</label>
              <textarea
                defaultValue={b.description}
                onBlur={(e) => updateBusiness(b.id, "description", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">Contact</label>
              <input
                defaultValue={b.contact}
                onBlur={(e) => updateBusiness(b.id, "contact", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">Address</label>
              <input
                defaultValue={b.address}
                onBlur={(e) => updateBusiness(b.id, "address", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">Hours</label>
              <input
                defaultValue={b.hours}
                onBlur={(e) => updateBusiness(b.id, "hours", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <p className="text-sm text-neutral-400 mb-2">Status: {b.Status}</p>
              <div className="flex gap-2">
                <button onClick={() => approveBusiness(b.id)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">Approve</button>
                <button onClick={() => rejectBusiness(b.id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Reject / Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}