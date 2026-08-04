"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const GRID_SIZE = 6;
const SHIP_CELLS_NEEDED = 7;

export default function BattleshipRoom() {
  const { roomcode } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const me = searchParams.get("as") || "player1";
  const opponent = me === "player1" ? "player2" : "player1";

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCells, setSelectedCells] = useState([]);
  const [myShots, setMyShots] = useState([]);
  const [enemyShots, setEnemyShots] = useState([]);
  const [myShipCount, setMyShipCount] = useState(0);
  const [opponentShipCount, setOpponentShipCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const fetchRoom = useCallback(async () => {
    const { data } = await supabase
      .from("battleship_rooms")
      .select("*")
      .eq("room_code", roomcode.toUpperCase())
      .single();
    setRoom(data);
    setLoading(false);
  }, [roomcode]);

  const fetchShots = useCallback(async () => {
    if (!room) return;
    const { data: mine } = await supabase
      .from("battleship_shots")
      .select("*")
      .eq("room_id", room.id)
      .eq("shooter", me);
    setMyShots(mine || []);

    const { data: theirs } = await supabase
      .from("battleship_shots")
      .select("*")
      .eq("room_id", room.id)
      .eq("shooter", opponent);
    setEnemyShots(theirs || []);
  }, [room, me, opponent]);

  const fetchShipCounts = useCallback(async () => {
    if (!room) return;
    const { count: myCount } = await supabase
      .from("battleship_ships")
      .select("*", { count: "exact", head: true })
      .eq("room_id", room.id)
      .eq("player", me);
    setMyShipCount(myCount || 0);

    const { count: oppCount } = await supabase
      .from("battleship_ships")
      .select("*", { count: "exact", head: true })
      .eq("room_id", room.id)
      .eq("player", opponent);
    setOpponentShipCount(oppCount || 0);
  }, [room, me, opponent]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (!room) return;
    fetchShots();
    fetchShipCounts();

    const channel = supabase
      .channel(`battleship-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "battleship_rooms", filter: `id=eq.${room.id}` },
        () => fetchRoom()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "battleship_shots", filter: `room_id=eq.${room.id}` },
        () => fetchShots()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "battleship_ships", filter: `room_id=eq.${room.id}` },
        () => fetchShipCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  function toggleCell(x, y) {
    const key = `${x},${y}`;
    setSelectedCells((prev) => {
      const exists = prev.includes(key);
      if (exists) return prev.filter((c) => c !== key);
      if (prev.length >= SHIP_CELLS_NEEDED) return prev;
      return [...prev, key];
    });
  }

  async function confirmPlacement() {
    if (selectedCells.length !== SHIP_CELLS_NEEDED) return;

    const rows = selectedCells.map((c) => {
      const [x, y] = c.split(",").map(Number);
      return { room_id: room.id, player: me, x, y };
    });

    await supabase.from("battleship_ships").insert(rows);

    const readyField = me === "player1" ? "player1_ready" : "player2_ready";
    const { data: updated } = await supabase
      .from("battleship_rooms")
      .update({ [readyField]: true })
      .eq("id", room.id)
      .select()
      .single();

    const bothReady =
      (me === "player1" ? true : updated.player1_ready) &&
      (me === "player2" ? true : updated.player2_ready);

    if (bothReady) {
      await supabase
        .from("battleship_rooms")
        .update({ status: "playing", current_turn: "player1" })
        .eq("id", room.id);
    }

    fetchShipCounts();
    fetchRoom();
  }

  async function fireAt(x, y) {
    if (room.current_turn !== me) return;
    if (myShots.some((s) => s.x === x && s.y === y)) return;

    const { data: enemyShip } = await supabase
      .from("battleship_ships")
      .select("*")
      .eq("room_id", room.id)
      .eq("player", opponent)
      .eq("x", x)
      .eq("y", y)
      .maybeSingle();

    const hit = !!enemyShip;

    await supabase.from("battleship_shots").insert({
      room_id: room.id,
      shooter: me,
      x,
      y,
      hit,
    });

    const { count: totalHits } = await supabase
      .from("battleship_shots")
      .select("*", { count: "exact", head: true })
      .eq("room_id", room.id)
      .eq("shooter", me)
      .eq("hit", true);

    const newTotalHits = (totalHits || 0) + (hit ? 1 : 0);

    if (newTotalHits >= SHIP_CELLS_NEEDED) {
      await supabase
        .from("battleship_rooms")
        .update({ status: "finished", winner: me })
        .eq("id", room.id);
    } else {
      await supabase
        .from("battleship_rooms")
        .update({ current_turn: opponent })
        .eq("id", room.id);
    }

    fetchShots();
    fetchRoom();
  }

  function copyRoomCode() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(room.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <p className="text-neutral-400">Loading...</p>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">Room not found.</p>
          <Link href="/games/battleship" className="text-orange-400 underline">
            Back to Battleship
          </Link>
        </div>
      </main>
    );
  }

  // Edge case: trying to join as player2 on a room that's not waiting for one
  if (me === "player2" && room.status === "waiting" && !room.player2_name) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-neutral-400 mb-4">This room isn't ready yet.</p>
          <Link href="/games/battleship" className="text-orange-400 underline">
            Back to Battleship
          </Link>
        </div>
      </main>
    );
  }

  const myName = me === "player1" ? room.player1_name : room.player2_name;
  const opponentName = me === "player1" ? room.player2_name : room.player1_name;
  const myShipsSunk = SHIP_CELLS_NEEDED - myShipCount === 0 ? enemyShots.filter((s) => s.hit).length : enemyShots.filter((s) => s.hit).length;
  const myShipsRemaining = Math.max(0, myShipCount - enemyShots.filter((s) => s.hit).length);
  const opponentShipsRemaining = Math.max(0, opponentShipCount - myShots.filter((s) => s.hit).length);

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-1">
          <Link href="/games/battleship" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Leave
          </Link>
          <h1 className="text-2xl font-bold">🚢 Battleship</h1>
          <div className="w-10" />
        </div>

        <button
          onClick={copyRoomCode}
          className="block mx-auto text-center text-neutral-500 text-sm mb-6 hover:text-orange-400"
        >
          Room: <span className="text-orange-400 font-mono">{room.room_code}</span>{" "}
          {copied ? "✓ Copied!" : "📋"}
        </button>

        {room.status === "waiting" && (
          <div className="text-center">
            <p className="text-neutral-300 mb-2">
              Waiting for an opponent to join...
            </p>
            <p className="text-neutral-500 text-sm mb-2">
              Share this room code:
            </p>
            <button
              onClick={copyRoomCode}
              className="text-4xl font-mono text-orange-400 mb-6 block mx-auto"
            >
              {room.room_code}
            </button>
          </div>
        )}

        {room.status === "placing" && (
          <div>
            <p className="text-neutral-300 text-center mb-1">
              {opponentName} has joined!
            </p>
            <p className="text-neutral-400 text-center text-sm mb-4">
              Click {SHIP_CELLS_NEEDED} cells to place your ships ({selectedCells.length}/{SHIP_CELLS_NEEDED})
            </p>

            {myShipCount > 0 ? (
              <p className="text-center text-green-400 mb-4">
                ✅ Ships placed! Waiting for opponent...
              </p>
            ) : (
              <>
                <div
                  className="grid gap-1 mx-auto mb-4"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                    maxWidth: "320px",
                  }}
                >
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                    const x = i % GRID_SIZE;
                    const y = Math.floor(i / GRID_SIZE);
                    const key = `${x},${y}`;
                    const selected = selectedCells.includes(key);
                    return (
                      <button
                        key={key}
                        onClick={() => toggleCell(x, y)}
                        className={`aspect-square rounded ${
                          selected ? "bg-orange-500" : "bg-neutral-800 hover:bg-neutral-700"
                        }`}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={confirmPlacement}
                  disabled={selectedCells.length !== SHIP_CELLS_NEEDED}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-40 transition text-black font-semibold rounded-lg px-4 py-3"
                >
                  Confirm Placement
                </button>
              </>
            )}
          </div>
        )}

        {room.status === "playing" && (
          <div>
            <p className="text-center mb-2 font-semibold">
              {room.current_turn === me ? (
                <span className="text-green-400">Your turn!</span>
              ) : (
                <span className="text-neutral-400">{opponentName}'s turn...</span>
              )}
            </p>

            <div className="flex justify-center gap-6 mb-4 text-sm text-neutral-400">
              <span>🚢 You: {myShipsRemaining}/{SHIP_CELLS_NEEDED}</span>
              <span>🚢 {opponentName}: {opponentShipsRemaining}/{SHIP_CELLS_NEEDED}</span>
            </div>

            <p className="text-sm text-neutral-400 text-center mb-2">
              Fire at {opponentName}'s board:
            </p>
            <div
              className="grid gap-1 mx-auto mb-6"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                maxWidth: "320px",
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const shot = myShots.find((s) => s.x === x && s.y === y);
                let cellClass = "bg-neutral-800 hover:bg-neutral-700";
                if (shot) cellClass = shot.hit ? "bg-red-600" : "bg-neutral-600";
                return (
                  <button
                    key={`${x},${y}`}
                    onClick={() => fireAt(x, y)}
                    disabled={room.current_turn !== me || !!shot}
                    className={`aspect-square rounded ${cellClass}`}
                  >
                    {shot ? (shot.hit ? "💥" : "•") : ""}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-neutral-400 text-center mb-2">
              {opponentName}'s shots on you:
            </p>
            <div
              className="grid gap-1 mx-auto"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                maxWidth: "320px",
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const shot = enemyShots.find((s) => s.x === x && s.y === y);
                let cellClass = "bg-neutral-900";
                if (shot) cellClass = shot.hit ? "bg-red-800" : "bg-neutral-700";
                return (
                  <div
                    key={`${x},${y}`}
                    className={`aspect-square rounded flex items-center justify-center text-xs ${cellClass}`}
                  >
                    {shot ? (shot.hit ? "💥" : "•") : ""}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {room.status === "finished" && (
          <div className="text-center">
            <p className="text-3xl mb-4">
              {room.winner === me ? "🎉 You Won!" : "💀 You Lost"}
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => router.push("/games/battleship")}
                className="bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-lg px-6 py-3"
              >
                Play Again
              </button>
              <Link href="/games" className="text-neutral-400 hover:text-white underline text-sm">
                Back to Games
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}