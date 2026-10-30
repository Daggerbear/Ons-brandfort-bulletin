// src/lib/createHelpers.js
import { supabase } from "@/lib/supabase";

const EXT_BY_TYPE = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Resize to max 1400px wide and save as a light JPEG.
// Falls back to the original file if anything goes wrong or it wouldn't get smaller.
export async function compressPhoto(file, maxWidth = 1400, quality = 0.8) {
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

// Shrink logos to max 512px. Keeps PNG/WEBP transparency.
export async function compressLogo(file, maxSize = 512, quality = 0.85) {
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

// Uploads a picture and returns its public URL. Throws if the upload fails.
// mode "logo" keeps transparency, mode "photo" makes a light JPEG.
export async function uploadPhoto(bucket, file, mode = "photo") {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  if (mode === "logo") {
    const upload = await compressLogo(file);
    const contentType = upload.type || file.type;
    const ext = EXT_BY_TYPE[contentType] || file.name.split(".").pop() || "png";
    const fileName = `${stamp}.${ext}`;
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, upload, { contentType });
    if (error) throw error;
    return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
  }

  const upload = await compressPhoto(file);
  const compressed = upload !== file;
  const ext = compressed ? "jpg" : file.name.split(".").pop() || "jpg";
  const fileName = `${stamp}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(fileName, upload, compressed ? { contentType: "image/jpeg" } : undefined);
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(fileName).data.publicUrl;
}

// Things we remember on this phone only (never sent to us)
export function recall(key, fallback = "") {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function remember(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

// Keeps the old "my listings" lists working so "mark as sold/filled" still shows up
export function rememberMine(key, id) {
  try {
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    localStorage.setItem(key, JSON.stringify([...list, id]));
  } catch {}
}