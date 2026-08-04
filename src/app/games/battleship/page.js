"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function BattleshipHome() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) {
      setError("Enter your name first.");
      return;
    }
    setLoading(true);
    setError("");

    const roomCode = generateRoomCode();

    const { data, error: insertError } = await supabase
      .from("battleship_rooms")
      .insert({
        room_code: roomCode,
        player1_name: name.trim(),
        status: "waiting",
      })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError("Something went wrong creating the room.");
      return;
    }

    router.push(`/games/battleship/${data.room_code}?as=player1`);
  }

  async function handleJoin() {
    if (!name.trim() || !joinCode.trim()) {
      setError("Enter your name and a room code.");
      return;
    }
    setLoading(true);
    setError("");

    const code = joinCode.trim().toUpperCase();
    const enteredName = name.trim();

    const { data, error: fetchError } = await supabase
      .from("battleship_rooms")
      .select("*")
      .eq("room_code", code)
      .single();

    if (fetchError || !data) {
      setLoading(false);
      setError("Room not found.");
      return;
    }

    // Rejoin: name matches an existing player in this room
    if (data.player1_name === enteredName) {
      setLoading(false);
      router.push(`/games/battleship/${code}?as=player1`);
      return;
    }
    if (data.player2_name === enteredName) {
      setLoading(false);
      router.push(`/games/battleship/${code}?as=player2`);
      return;
    }

    // New player trying to join
    if (data.player2_name) {
      setLoading(false);
      setError("That room is already full.");
      return;
    }

    const { error: updateError } = await supabase
      .from("battleship_rooms")
      .update({ player2_name: enteredName, status: "placing" })
      .eq("id", data.id);

    setLoading(false);

    if (updateError) {
      setError("Something went wrong joining the room.");
      return;
    }

    router.push(`/games/battleship/${code}?as=player2`);
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2">🚢 Battleship</h1>
        <p className="text-neutral-400 text-center mb-8">
          Play against a friend, no account needed.
        </p>

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white mb-4 focus:border-orange-500 outline-none"
        />

        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3 mb-4 disabled:opacity-50"
        >
          {loading ? "..." : "Create New Game"}
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-neutral-800" />
          <span className="text-neutral-500 text-sm">or</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        <input
          type="text"
          placeholder="Room code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white mb-4 uppercase focus:border-orange-500 outline-none"
        />

        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full bg-neutral-800 hover:bg-neutral-700 transition text-white font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
        >
          {loading ? "..." : "Join / Rejoin Game"}
        </button>

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
      </div>
    </main>
  );
}