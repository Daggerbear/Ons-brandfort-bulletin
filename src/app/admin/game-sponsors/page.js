"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

const GAMES = [
  { slug: "battleship", name: "🚢 Battleship" },
  { slug: "chess", name: "♟️ Chess" },
  { slug: "sudoku", name: "🔢 Sudoku" },
  { slug: "checkers", name: "🔴 Checkers" },
  { slug: "riddle-rush", name: "🧩 Riddle Rush" },
  { slug: "block-rush", name: "🧱 Block Rush" },
  { slug: "whack-a-mole", name: "🔨 Whack-a-Mole" },
  { slug: "snake", name: "🐍 Snake" },
  { slug: "brick-breaker", name: "🧱 Brick Breaker" },
  { slug: "merge-rush", name: "🔢 Merge Rush" },
];

export default function AdminGameSponsors() {
  const [sponsors, setSponsors] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [selectedGame, setSelectedGame] = useState(GAMES[0].slug);
  const [mode, setMode] = useState("real");
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSponsors();
    fetchBusinesses();
  }, []);

  async function fetchSponsors() {
    setLoading(true);
    const { data, error } = await supabase
      .from("game_sponsors")
      .select("*, businesses(*)")
      .order("created_at", { ascending: false });
    if (!error) setSponsors(data);
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

  const gameHasActiveSponsor = (slug) =>
    sponsors.some((s) => s.game_slug === slug && s.active);

  async function handleAdd(e) {
    e.preventDefault();

    if (gameHasActiveSponsor(selectedGame)) {
      alert("This game already has an active sponsor. Deactivate or remove it first.");
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
            game_slug: selectedGame,
            business_id: selectedBusiness,
            custom_name: null,
            custom_description: null,
            active: true,
            custom_image_url,
          }
        : {
            game_slug: selectedGame,
            business_id: null,
            custom_name: customName.trim(),
            custom_description: customDescription.trim(),
            active: true,
            custom_image_url,
          };

    const { error } = await supabase.from("game_sponsors").insert(payload);

    setSaving(false);

    if (error) {
      alert("Something went wrong adding the sponsor.");
      return;
    }

    setSelectedBusiness("");
    setCustomName("");
    setCustomDescription("");
    setImageFile(null);
    fetchSponsors();
  }

  async function handleFlyerUpdate(id, file) {
    if (!file) return;
    const url = await uploadFlyer(file);
    if (!url) {
      alert("Flyer upload failed.");
      return;
    }
    const { error } = await supabase
      .from("game_sponsors")
      .update({ custom_image_url: url })
      .eq("id", id);
    if (!error) {
      setSponsors((prev) =>
        prev.map((s) => (s.id === id ? { ...s, custom_image_url: url } : s))
      );
    }
  }

  async function toggleActive(id, current) {
    const { error } = await supabase
      .from("game_sponsors")
      .update({ active: !current })
      .eq("id", id);
    if (!error) {
      setSponsors((prev) =>
        prev.map((s) => (s.id === id ? { ...s, active: !current } : s))
      );
    }
  }

  async function handleRemove(id) {
    if (!confirm("Remove this sponsor?")) return;
    const { error } = await supabase.from("game_sponsors").delete().eq("id", id);
    if (!error) setSponsors((prev) => prev.filter((s) => s.id !== id));
  }

  const availableBusinesses = businesses.filter(
    (b) => !sponsors.some((s) => s.business_id === b.id && s.active)
  );

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Game Sponsors</h1>
          <Link href="/admin" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Back
          </Link>
        </div>

        <label className="block text-xs text-neutral-500 mb-1">Game</label>
        <select
          value={selectedGame}
          onChange={(e) => setSelectedGame(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-3 text-white mb-2"
        >
          {GAMES.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name} {gameHasActiveSponsor(g.slug) ? "(sponsored)" : ""}
            </option>
          ))}
        </select>

        {gameHasActiveSponsor(selectedGame) ? (
          <div className="bg-neutral-900 border border-dashed border-neutral-700 rounded-xl p-4 mb-8 text-center text-sm text-neutral-400">
            This game already has an active sponsor. Deactivate or remove it below to add a new one.
          </div>
        ) : (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("real")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  mode === "real"
                    ? "bg-orange-500 text-black"
                    : "bg-neutral-900 border border-neutral-700 text-neutral-300"
                }`}
              >
                Real Business
              </button>
              <button
                onClick={() => setMode("demo")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
                  mode === "demo"
                    ? "bg-orange-500 text-black"
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
                📷 {imageFile ? imageFile.name : "Choose banner image"}
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
                className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
              >
                {saving ? "Adding..." : `Add Sponsor to ${GAMES.find((g) => g.slug === selectedGame)?.name}`}
              </button>
            </form>
          </>
        )}

        {loading && <p className="text-neutral-400">Loading...</p>}
        {!loading && sponsors.length === 0 && (
          <p className="text-neutral-400">No game sponsors yet.</p>
        )}

        <div className="space-y-3">
          {sponsors.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="text-xs text-neutral-500 uppercase">
                    {GAMES.find((g) => g.slug === item.game_slug)?.name || item.game_slug}
                  </p>
                  <p className="font-semibold">
                    {item.businesses?.name || item.custom_name}
                    {!item.business_id && (
                      <span className="text-xs text-neutral-500 ml-2">(Demo)</span>
                    )}
                  </p>
                </div>
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
                📷 {item.custom_image_url ? "Change banner" : "Upload banner"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFlyerUpdate(item.id, e.target.files[0])}
                  className="hidden"
                />
              </label>

              <div className="flex gap-3 items-center flex-wrap">
                <button
                  onClick={() => toggleActive(item.id, item.active)}
                  className="text-sm text-orange-400 hover:text-orange-300"
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