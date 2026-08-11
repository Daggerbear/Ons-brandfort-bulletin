"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getStoredPlayer, clearStoredPlayer } from "@/lib/playerAuth";
import {
  findAndClaimWaitingOpponent,
  createQueueEntry,
  markQueueMatched,
  cancelQueueEntry,
  subscribeToQueueEntry,
} from "@/lib/matchmaking";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function ChessHome() {
  const router = useRouter();
  const [player, setPlayer] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [queueId, setQueueId] = useState(null);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const unsubRef = useRef(null);

  useEffect(() => {
    setPlayer(getStoredPlayer());
    return () => {
      if (unsubRef.current) unsubRef.current();
    };
  }, []);

  function switchPlayer() {
    clearStoredPlayer();
    window.location.href = "/games";
  }

  async function handleCreate() {
    setLoading(true);
    setError("");

    const roomCode = generateRoomCode();

    const { data, error: insertError } = await supabase
      .from("chess_rooms")
      .insert({
        room_code: roomCode,
        player1_name: player.name,
        status: "waiting",
      })
      .select()
      .single();

    setLoading(false);

    if (insertError) {
      setError("Something went wrong creating the room.");
      return;
    }

    router.push(`/games/chess/${data.room_code}?as=player1`);
  }

  async function handleJoin() {
    if (!joinCode.trim()) {
      setError("Enter a room code.");
      return;
    }
    setLoading(true);
    setError("");

    const code = joinCode.trim().toUpperCase();

    const { data, error: fetchError } = await supabase
      .from("chess_rooms")
      .select("*")
      .eq("room_code", code)
      .single();

    if (fetchError || !data) {
      setLoading(false);
      setError("Room not found.");
      return;
    }

    if (data.player1_name === player.name) {
      setLoading(false);
      router.push(`/games/chess/${code}?as=player1`);
      return;
    }
    if (data.player2_name === player.name) {
      setLoading(false);
      router.push(`/games/chess/${code}?as=player2`);
      return;
    }

    if (data.player2_name) {
      setLoading(false);
      setError("That room is already full.");
      return;
    }

    const { error: updateError } = await supabase
      .from("chess_rooms")
      .update({ player2_name: player.name, status: "playing" })
      .eq("id", data.id);

    setLoading(false);

    if (updateError) {
      setError("Something went wrong joining the room.");
      return;
    }

    router.push(`/games/chess/${code}?as=player2`);
  }

  async function handleRandomOpponent() {
    setError("");
    setSearching(true);

    const candidate = await findAndClaimWaitingOpponent("chess", player.cell);

    if (candidate) {
      const roomCode = generateRoomCode();
      const { data, error: insertError } = await supabase
        .from("chess_rooms")
        .insert({
          room_code: roomCode,
          player1_name: candidate.player_name,
          player2_name: player.name,
          status: "playing",
        })
        .select()
        .single();

      if (insertError || !data) {
        setSearching(false);
        setError("Something went wrong matching you.");
        return;
      }

      await markQueueMatched(candidate.id, roomCode, "player1");
      router.push(`/games/chess/${roomCode}?as=player2`);
      return;
    }

    const entry = await createQueueEntry("chess", player.name, player.cell);
    if (!entry) {
      setSearching(false);
      setError("Something went wrong. Try again.");
      return;
    }
    setQueueId(entry.id);

    unsubRef.current = subscribeToQueueEntry(entry.id, (row) => {
      router.push(`/games/chess/${row.room_code}?as=${row.as_role}`);
    });
  }

  async function handleCancelSearch() {
    if (unsubRef.current) unsubRef.current();
    if (queueId) await cancelQueueEntry(queueId);
    setSearching(false);
    setQueueId(null);
  }

  if (!player) return null;

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-2">♟️ Chess</h1>
        <p className="text-neutral-500 text-center text-sm mb-4">
          Playing as <span className="text-orange-400">{player.name}</span> ·{" "}
          <button onClick={switchPlayer} className="underline hover:text-white">
            Not you?
          </button>
        </p>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-full text-center text-sm text-orange-400 hover:text-orange-300 underline mb-6"
        >
          {showHelp ? "Hide" : "❓ How to Play"}
        </button>

        {showHelp && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6 text-sm text-neutral-300 space-y-2">
            <p>🎮 Create a room and share the code, or find a random opponent.</p>
            <p>♟️ Player 1 plays White, Player 2 plays Black. Standard chess rules.</p>
            <p>👑 Pawns that reach the last rank automatically promote to a Queen.</p>
          </div>
        )}

        {searching ? (
          <div className="text-center bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-4">
            <p className="text-neutral-300 mb-4">🔎 Searching for an opponent...</p>
            <button
              onClick={handleCancelSearch}
              className="text-sm text-neutral-500 hover:text-white underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleRandomOpponent}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 transition text-white font-semibold rounded-lg px-4 py-3 mb-4 disabled:opacity-50"
            >
              🎲 Random Opponent
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-neutral-800" />
              <span className="text-neutral-500 text-sm">or</span>
              <div className="flex-1 h-px bg-neutral-800" />
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-4 py-3 mb-4 disabled:opacity-50"
            >
              {loading ? "..." : "Create Room (Invite a Friend)"}
            </button>

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
              {loading ? "..." : "Join / Rejoin Room"}
            </button>
          </>
        )}

        {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
      </div>
    </main>
  );
}