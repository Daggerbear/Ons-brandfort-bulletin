"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAds();
    fetchBusinesses();
  }, []);

  async function fetchAds() {
    setLoading(true);
    const { data, error } = await supabase
      .from("sponsored_ads")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setAds(data);
    setLoading(false);
  }

  async function fetchBusinesses() {
    const { data, error } = await supabase
      .from("businesses")
      .select("id, name")
      .eq("Status", "approved")
      .order("name", { ascending: true });
    if (!error) setBusinesses(data);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!selectedBusiness || !imageFile) {
      alert("Please choose a business and a flyer photo.");
      return;
    }

    setUploading(true);

    const business = businesses.find((b) => b.id === parseInt(selectedBusiness));

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("ads")
      .upload(fileName, imageFile);

    if (uploadError) {
      alert("Upload failed.");
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("ads")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase.from("sponsored_ads").insert({
      business_id: business.id,
      business_name: business.name,
      image_url: publicUrlData.publicUrl,
      active: true,
    });

    setUploading(false);

    if (insertError) {
      alert("Something went wrong saving the ad.");
      return;
    }

    setSelectedBusiness("");
    setImageFile(null);
    fetchAds();
  }

  async function toggleActive(id, current) {
    const { error } = await supabase
      .from("sponsored_ads")
      .update({ active: !current })
      .eq("id", id);
    if (!error) {
      setAds((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !current } : a))
      );
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this ad?")) return;
    const { error } = await supabase.from("sponsored_ads").delete().eq("id", id);
    if (!error) setAds((prev) => prev.filter((a) => a.id !== id));
  }

  const activeCount = ads.filter((a) => a.active).length;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Sponsored Ads</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>

        <p className="text-sm text-neutral-400 mb-4">
          {activeCount} / 20 active ads
        </p>

        <form
          onSubmit={handleUpload}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-8 flex flex-col gap-3"
        >
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white"
          >
            <option value="">Choose a business...</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <label className="flex items-center justify-center gap-2 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white cursor-pointer">
            📷 {imageFile ? imageFile.name : "Choose flyer photo"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={uploading || activeCount >= 20}
            className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : activeCount >= 20
              ? "Max 20 active ads reached"
              : "Add Ad"}
          </button>
        </form>

        {loading && <p className="text-neutral-400">Loading...</p>}

        <div className="space-y-3">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">{ad.business_name}</p>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    ad.active
                      ? "bg-green-600 text-white"
                      : "bg-neutral-700 text-neutral-300"
                  }`}
                >
                  {ad.active ? "Active" : "Inactive"}
                </span>
              </div>

              <img
                src={ad.image_url}
                alt={ad.business_name}
                className="rounded-lg mb-3 w-full max-h-48 object-cover"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => toggleActive(ad.id, ad.active)}
                  className="text-sm text-orange-400 hover:text-orange-300"
                >
                  {ad.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}