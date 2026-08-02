"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminHomepage() {
  const [currentUrl, setCurrentUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_settings")
      .select("hero_image_url")
      .eq("id", 1)
      .single();
    if (!error) setCurrentUrl(data?.hero_image_url);
    setLoading(false);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!imageFile) {
      alert("Please choose an image.");
      return;
    }

    setUploading(true);

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `hero-${Date.now()}.${fileExt}`;
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

    const { error: updateError } = await supabase
      .from("site_settings")
      .update({ hero_image_url: publicUrlData.publicUrl })
      .eq("id", 1);

    setUploading(false);

    if (updateError) {
      alert("Something went wrong saving the setting.");
      return;
    }

    setCurrentUrl(publicUrlData.publicUrl);
    setImageFile(null);
  }

  async function handleRemove() {
    if (!confirm("Remove the homepage background image?")) return;
    const { error } = await supabase
      .from("site_settings")
      .update({ hero_image_url: null })
      .eq("id", 1);
    if (!error) setCurrentUrl(null);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Homepage Background</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>

        {loading && <p className="text-neutral-400">Loading...</p>}

        {!loading && currentUrl && (
          <div className="mb-6">
            <p className="text-sm text-neutral-400 mb-2">Current background:</p>
            <img
              src={currentUrl}
              alt="Current hero background"
              className="rounded-lg w-full max-h-56 object-cover border border-neutral-800"
            />
            <button
              onClick={handleRemove}
              className="text-sm text-red-400 hover:text-red-300 mt-2"
            >
              Remove background
            </button>
          </div>
        )}

        {!loading && !currentUrl && (
          <p className="text-neutral-400 mb-6">
            No custom background set — homepage currently uses the plain carbon texture.
          </p>
        )}

        <form
          onSubmit={handleUpload}
          className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3"
        >
          <label className="flex items-center justify-center gap-2 bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white cursor-pointer">
            📷 {imageFile ? imageFile.name : "Choose new background image"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="hidden"
            />
          </label>

          <button
            type="submit"
            disabled={uploading}
            className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Set as Background"}
          </button>
        </form>
      </div>
    </main>
  );
}