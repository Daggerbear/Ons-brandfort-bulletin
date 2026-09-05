"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

const MAX_SLOTS = 6;

export default function AdminGamesCarousel() {
  const [featured, setFeatured] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [mode, setMode] = useState("real");
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFeatured();
    fetchBusinesses();
  }, []);

  async function fetchFeatured() {
    setLoading(true);
    const { data, error } = await supabase
      .from("games_carousel")
      .select("*, businesses(*)")
      .order("display_order", { ascending: true });
    if (!error) setFeatured(data);
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

  async function uploadFlyer(file) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("ads")
      .upload(fileName, file);
    if (uploadError) return null;
    const { data } = supabase.storage.from("ads").getPublicUrl(fileName);
    return data.publicUrl;
  }

  async function handleAdd(e) {
    e.preventDefault();

    if (featured.length >= MAX_SLOTS) {
      alert(`All ${MAX_SLOTS} slots are full. Remove one first to add another.`);
      return;
    }

    if (mode === "real" && !selectedBusiness) {
      alert("Please choose a business.");
      return;
    }
    if (mode === "demo" && !customName.trim()) {
      alert("Please add a name for the demo entry.");
      return;
    }

    setSaving(true);
    const nextOrder = featured.length;

    let custom_image_url = null;
    if (imageFile) {
      custom_image_url = await uploadFlyer(imageFile);
      if (!custom_image_url) {
        alert("Flyer upload failed.");
        setSaving(false);
        return;
      }
    }

    const payload =
      mode === "real"
        ? {
            business_id: selectedBusiness,
            custom_name: null,
            custom_description: null,
            display_order: nextOrder,
            active: true,
            custom_image_url,
          }
        : {
            business_id: null,
            custom_name: customName.trim(),
            custom_description: customDescription.trim(),
            display_order: nextOrder,
            active: true,
            custom_image_url,
          };

    const { error } = await supabase.from("games_carousel").insert(payload);

    setSaving(false);

    if (error) {
      alert("Something went wrong. That business might already be in the carousel.");
      return;
    }

    setSelectedBusiness("");
    setCustomName("");
    setCustomDescription("");
    setImageFile(null);
    fetchFeatured();
  }

  async function handleFlyerUpdate(id, file) {
    if (!file) return;
    const url = await uploadFlyer(file);
    if (!url) {
      alert("Flyer upload failed.");
      return;
    }
    const { error } = await supabase
      .from("games_carousel")
      .update({ custom_image_url: url })
      .eq("id", id);
    if (!error) {
      setFeatured((prev) =>
        prev.map((f) => (f.id === id ? { ...f, custom_image_url: url } : f))
      );
    }
  }

  async function toggleActive(id, current) {
    const { error } = await supabase
      .from("games_carousel")
      .update({ active: !current })
      .eq("id", id);
    if (!error) {
      setFeatured((prev) =>
        prev.map((f) => (f.id === id ? { ...f, active: !current } : f))
      );
    }
  }

  async function handleRemove(id) {
    if (!confirm("Remove this from the games carousel?")) return;
    const { error } = await supabase
      .from("games_carousel")
      .delete()
      .eq("id", id);
    if (!error) setFeatured((prev) => prev.filter((f) => f.id !== id));
  }

  async function moveOrder(index, direction) {
    const newFeatured = [...featured];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newFeatured.length) return;

    [newFeatured[index], newFeatured[targetIndex]] = [
      newFeatured[targetIndex],
      newFeatured[index],
    ];

    setFeatured(newFeatured);

    await Promise.all(
      newFeatured.map((item, i) =>
        supabase
          .from("games_carousel")
          .update({ display_order: i })
          .eq("id", item.id)
      )
    );
  }

  const featuredBusinessIds = featured
    .filter((f) => f.business_id)
    .map((f) => f.business_id);
  const availableBusinesses = businesses.filter(
    (b) => !featuredBusinessIds.includes(b.id)
  );
  const slotsFull = featured.length >= MAX_SLOTS;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Games Carousel</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>
        <p className="text-sm text-neutral-500 mb-8">
          {featured.length} / {MAX_SLOTS} slots filled
        </p>

        {slotsFull ? (
          <div className="bg-neutral-900 border border-dashed border-neutral-700 rounded-xl p-4 mb-8 text-center text-sm text-neutral-400">
            All {MAX_SLOTS} slots are full. Remove one below to add another.
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("real")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  mode === "real"
                    ? "bg-purple-500 text-black"
                    : "bg-neutral-900 border border-neutral-700 text-neutral-300"
                }`}
              >
                Real Business
              </button>
              <button
                onClick={() => setMode("demo")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  mode === "demo"
                    ? "bg-purple-500 text-black"
                    : "bg-neutral-900 border border-neutral-700 text-neutral-300"
                }`}
              >
                Demo / Mockup
              </button>
            </div>

            <form
              onSubmit={handleAdd}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-8 flex flex-col gap-3"
            >
              {mode === "real" ? (
                <select
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white"
                >
                  <option value="">Choose a business...</option>
                  {availableBusinesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Demo business name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white"
                  />
                  <textarea
                    placeholder="Short description (optional)"
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    rows={2}
                    className="bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white"
                  />
                </>
              )}

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
                disabled={saving}
                className="bg-purple-500 hover:bg-purple-600 transition text-black font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add to Carousel"}
              </button>
            </form>
          </>
        )}

        {loading && <p className="text-neutral-400">Loading...</p>}
        {!loading && featured.length === 0 && (
          <p className="text-neutral-400">No sponsors yet.</p>
        )}

        <div className="space-y-3">
          {featured.map((item, index) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">
                  {item.businesses?.name || item.custom_name}
                  {!item.business_id && (
                    <span className="text-xs text-neutral-500 ml-2">(Demo)</span>
                  )}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    item.active
                      ? "bg-green-600 text-white"
                      : "bg-neutral-700 text-neutral-300"
                  }`}
                >
                  {item.active ? "Active" : "Inactive"}
                </span>
              </div>

              {(item.custom_image_url || item.businesses?.logo_url) && (
                <div className="relative w-full h-40 mb-3">
                  <Image
                    src={item.custom_image_url || item.businesses?.logo_url}
                    alt={item.businesses?.name || item.custom_name}
                    fill
                    sizes="(max-width: 640px) 100vw, 600px"
                    className="object-cover rounded-lg"
                  />
                </div>
              )}

              <label className="flex items-center justify-center gap-2 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-neutral-300 cursor-pointer mb-3">
                📷 {item.custom_image_url ? "Change flyer" : "Upload flyer"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFlyerUpdate(item.id, e.target.files[0])}
                  className="hidden"
                />
              </label>

              <div className="flex gap-3 items-center flex-wrap">
                <button
                  onClick={() => moveOrder(index, -1)}
                  disabled={index === 0}
                  className="text-sm text-neutral-400 hover:text-white disabled:opacity-30"
                >
                  ↑ Up
                </button>
                <button
                  onClick={() => moveOrder(index, 1)}
                  disabled={index === featured.length - 1}
                  className="text-sm text-neutral-400 hover:text-white disabled:opacity-30"
                >
                  ↓ Down
                </button>
                <button
                  onClick={() => toggleActive(item.id, item.active)}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  {item.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}