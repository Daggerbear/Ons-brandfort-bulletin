"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminEvents() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);
  const [events, setEvents] = useState([]);
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
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated]);

  const updateEvent = async (id, field, value) => {
    await supabase.from("events").update({ [field]: value }).eq("id", id);
  };

  const approveEvent = async (id) => {
    await supabase.from("events").update({ status: "approved" }).eq("id", id);
    loadData();
  };

  const rejectEvent = async (id) => {
    await supabase.from("events").delete().eq("id", id);
    loadData();
  };

  const handlePhotoChange = async (eventId, file) => {
    if (!file) return;
    setUploadingId(eventId);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("events-photos")
      .upload(fileName, file);

    if (uploadError) {
      alert("Photo upload failed: " + uploadError.message);
      setUploadingId(null);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("events-photos")
      .getPublicUrl(fileName);

    await updateEvent(eventId, "image_url", publicUrlData.publicUrl);
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
        <h1 className="text-3xl font-bold mb-8 mt-4">Events</h1>

        {loading && <p className="text-neutral-400">Loading...</p>}

        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
              <label className="block text-xs text-neutral-500 mb-1">Photo</label>
              <div className="flex items-center gap-3 mb-2">
                {ev.image_url ? (
                  <img
                    src={ev.image_url}
                    alt={ev.title}
                    className="w-16 h-16 object-cover rounded-lg border border-neutral-800"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg border border-neutral-800 bg-neutral-800 flex items-center justify-center text-xs text-neutral-500">
                    No photo
                  </div>
                )}
                <label className="text-sm bg-neutral-800 hover:bg-neutral-700 transition rounded-lg px-3 py-2 cursor-pointer">
                  {uploadingId === ev.id ? "Uploading..." : "Change photo"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    disabled={uploadingId === ev.id}
                    onChange={(e) => handlePhotoChange(ev.id, e.target.files[0])}
                  />
                </label>
              </div>

              <label className="block text-xs text-neutral-500 mb-1">Title</label>
              <input
                defaultValue={ev.title}
                onBlur={(e) => updateEvent(ev.id, "title", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">Date</label>
              <input
                defaultValue={ev.date}
                onBlur={(e) => updateEvent(ev.id, "date", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">Time</label>
              <input
                defaultValue={ev.time}
                onBlur={(e) => updateEvent(ev.id, "time", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">Location</label>
              <input
                defaultValue={ev.location}
                onBlur={(e) => updateEvent(ev.id, "location", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">Description</label>
              <textarea
                defaultValue={ev.description}
                onBlur={(e) => updateEvent(ev.id, "description", e.target.value)}
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <label className="block text-xs text-neutral-500 mb-1">WhatsApp Number</label>
              <input
                defaultValue={ev.whatsapp}
                onBlur={(e) => updateEvent(ev.id, "whatsapp", e.target.value)}
                placeholder="e.g. 0821234567"
                className="w-full bg-neutral-800 rounded px-3 py-2 mb-2 text-white"
              />
              <p className="text-sm text-neutral-400 mb-2">status: {ev.status}</p>
              <div className="flex gap-2">
                <button onClick={() => approveEvent(ev.id)} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm">Approve</button>
                <button onClick={() => rejectEvent(ev.id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm">Reject / Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}