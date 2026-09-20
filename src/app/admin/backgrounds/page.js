// src/app/admin/backgrounds/page.js
"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const KNOWN_KEYS = [
  { key: "homepage_hero", label: "Homepage Hero Background" },
  { key: "homepage_logo", label: "Homepage Logo" },
  { key: "business_zone_bg", label: "Business Zone Background" },
  { key: "community_zone_bg", label: "Community Zone Background" },
  { key: "emergency_zone_bg", label: "Emergency Zone Background" },
  { key: "games_hero", label: "Game Room Background" },
  { key: "games_logo", label: "Game Room Logo" },
];

// Logos keep their original format so transparency isn't lost
const NO_COMPRESS = ["homepage_logo", "games_logo"];

// Resize to max 1600px wide and save as a light JPEG.
// If anything goes wrong, or it wouldn't get smaller, the original file is used.
async function compressImage(file, maxWidth = 1600, quality = 0.8) {
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

    let uploadFile = file;
    if (!NO_COMPRESS.includes(key)) {
      uploadFile = await compressImage(file);
    }
    const compressed = uploadFile !== file;

    const fileExt = compressed ? "jpg" : file.name.split(".").pop();
    const fileName = `${key}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("ads")
      .upload(
        fileName,
        uploadFile,
        compressed ? { contentType: "image/jpeg" } : undefined
      );

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
                  loading="lazy"
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