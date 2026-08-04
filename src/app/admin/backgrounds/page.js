"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const KNOWN_KEYS = [
  { key: "homepage_hero", label: "Homepage Hero Background" },
  { key: "games_hero", label: "Game Room Background" },
  { key: "games_logo", label: "Game Room Logo" },
];

export default function AdminBackgrounds() {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    setLoading(true);
    const { data, error } = await supabase.from("site_images").select("*");
    if (!error) {
      const map = {};
      data.forEach((row) => {
        map[row.key] = row.url;
      });
      setImages(map);
    }
    setLoading(false);
  }

  async function handleUpload(key, file) {
    if (!file) return;
    setUploadingKey(key);

    const fileExt = file.name.split(".").pop();
    const fileName = `${key}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("ads")
      .upload(fileName, file);

    if (uploadError) {
      alert("Upload failed.");
      setUploadingKey(null);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("ads")
      .getPublicUrl(fileName);

    const { error: upsertError } = await supabase
      .from("site_images")
      .upsert({ key, url: publicUrlData.publicUrl, updated_at: new Date().toISOString() });

    setUploadingKey(null);

    if (upsertError) {
      alert("Something went wrong saving the image.");
      return;
    }

    setImages((prev) => ({ ...prev, [key]: publicUrlData.publicUrl }));
  }

  async function handleRemove(key) {
    if (!confirm("Remove this image?")) return;
    const { error } = await supabase
      .from("site_images")
      .upsert({ key, url: null, updated_at: new Date().toISOString() });
    if (!error) setImages((prev) => ({ ...prev, [key]: null }));
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Site Backgrounds</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>

        {loading && <p className="text-neutral-400">Loading...</p>}

        <div className="space-y-6">
          {KNOWN_KEYS.map(({ key, label }) => (
            <div
              key={key}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <p className="font-semibold mb-3">{label}</p>

              {images[key] && (
                <img
                  src={images[key]}
                  alt={label}
                  className="rounded-lg mb-3 w-full max-h-40 object-cover"
                />
              )}

              <label className="flex items-center justify-center gap-2 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white cursor-pointer mb-3">
                📷 {uploadingKey === key ? "Uploading..." : images[key] ? "Change image" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUpload(key, e.target.files[0])}
                  disabled={uploadingKey === key}
                  className="hidden"
                />
              </label>

              {images[key] && (
                <button
                  onClick={() => handleRemove(key)}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
