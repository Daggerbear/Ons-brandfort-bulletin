"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getAllMovesForPlayer,
  applyMove,
  checkWinner,
  squareLabel,
} from "@/lib/checkersEngine";

export default function CheckersRoom() {
  const { roomcode } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const me = searchParams.get("as") || "player1";
  const opponent = me === "player1" ? "player2" : "player1";

  const [room, setRoom] = useState(null);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchRoom = useCallback(async () => {
    const { data } = await supabase
      .from("checkers_rooms")
      .select("*")
      .eq("room_code", roomcode.toUpperCase())
      .single();
    setRoom(data);
    setLoading(false);
  }, [roomcode]);

  const fetchMoves = useCallback(async () => {
    if (!room) return;
    const { data } = await supabase
      .from("checkers_moves")
      .select("*")
      .eq("room_id", room.id)
      .order("id", { ascending: true });
    setMoves(data || []);
  }, [room]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useEffect(() => {
    if (!room) return;
    fetchMoves();

    const channel = supabase
      .channel(`checkers-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkers_rooms", filter: `id=eq.${room.id}` },
        () => {
          setSelectedSquare(null);
          fetchRoom();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checkers_moves", filter: `room_id=eq.${room.id}` },
        () => fetchMoves()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  function copyRoomCode() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(room.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const isMyTurn = room?.status === "playing" && room.current_turn === me;
  const forcedSquare =
    room?.must_continue_row != null
      ? { row: room.must_continue_row, col: room.must_continue_col }
      : null;

  const allMoves = room && isMyTurn ? getAllMovesForPlayer(room.board, me, forcedSquare) : [];
  const legalTargetsForSelected = selectedSquare
    ? allMoves.filter((m) => m.from.row === selectedSquare.row && m.from.col === selectedSquare.col)
    : [];
  const selectableSquares = forcedSquare
    ? [forcedSquare]
    : [...new Set(allMoves.map((m) => `${m.from.row},${m.from.col}`))].map((s) => {
        const [row, col] = s.split(",").map(Number);
        return { row, col };
      });

  async function handleSquareClick(row, col) {
    if (!room || !isMyTurn) return;

    if (selectedSquare) {
      const move = legalTargetsForSelected.find((m) => m.to.row === row && m.to.col === col);
      if (move) {
        await executeMove(move);
        return;
      }
      const isSelectable = !forcedSquare && selectableSquares.some((s) => s.row === row && s.col === col);
      if (isSelectable) {
        setSelectedSquare({ row, col });
      } else {
        setSelectedSquare(null);
      }
      return;
    }

    const isSelectable = selectableSquares.some((s) => s.row === row && s.col === col);
    if (isSelectable) setSelectedSquare({ row, col });
  }

  async function executeMove(move) {
    const newBoard = applyMove(room.board, move);
    const isCapture = !!move.captured;

    let nextTurn = opponent;
    let nextMustRow = null;
    let nextMustCol = null;
    let status = room.status;
    let winner = null;

    if (isCapture) {
      const continuation = getAllMovesForPlayer(newBoard, me, { row: move.to.row, col: move.to.col });
      if (continuation.length > 0) {
        nextTurn = me;
        nextMustRow = move.to.row;
        nextMustCol = move.to.col;
      }
    }

    if (nextTurn !== me) {
      const winnerCheck = checkWinner(newBoard, nextTurn);
      if (winnerCheck) {
        status = "finished";
        winner = winnerCheck;
      }
    }

    await supabase.from("checkers_moves").insert({
      room_id: room.id,
      player: me,
      move_desc: `${squareLabel(move.from.row, move.from.col)}${isCapture ? "x" : "-"}${squareLabel(move.to.row, move.to.col)}`,
    });

    await supabase
      .from("checkers_rooms")
      .update({
        board: newBoard,
        current_turn: nextTurn,
        must_continue_row: nextMustRow,
        must_continue_col: nextMustCol,
        status,
        winner,
      })
      .eq("id", room.id);

    setSelectedSquare(null);
    fetchRoom();
    fetchMoves();
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
          <Link href="/games/checkers" className="text-orange-400 underline">
            Back to Checkers
          </Link>
        </div>
      </main>
    );
  }

  const myName = me === "player1" ? room.player1_name : room.player2_name;
  const opponentName = me === "player1" ? room.player2_name : room.player1_name;
  const myPieceColor = me === "player1" ? "bg-red-500 border-red-300" : "bg-neutral-100 border-neutral-400";
  const oppPieceColor = me === "player1" ? "bg-neutral-100 border-neutral-400" : "bg-red-500 border-red-300";

  const flip = me === "player2";

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-1">
          <Link href="/games/checkers" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Leave
          </Link>
          <h1 className="text-2xl font-bold">🔴 Checkers</h1>
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
            <p className="text-neutral-300 mb-2">Waiting for an opponent to join...</p>
            <p className="text-neutral-500 text-sm mb-2">Share this room code:</p>
            <button onClick={copyRoomCode} className="text-4xl font-mono text-orange-400 mb-6 block mx-auto">
              {room.room_code}
            </button>
          </div>
        )}

        {(room.status === "playing" || room.status === "finished") && (
          <div>
            <p className="text-center mb-2 font-semibold">
              {room.status === "playing" ? (
                isMyTurn ? (
                  <span className="text-green-400">
                    Your turn!{forcedSquare ? " Continue jumping!" : ""}
                  </span>
                ) : (
                  <span className="text-neutral-400">{opponentName}'s turn...</span>
                )
              ) : null}
            </p>

            <p className="text-center text-sm text-neutral-500 mb-4">
              You: {myName} · {opponentName}: {opponentName || "..."}
            </p>

            <div
              className="grid gap-0 mx-auto mb-4 border-2 border-neutral-800"
              style={{ gridTemplateColumns: "repeat(8, 1fr)", maxWidth: "360px" }}
            >
              {Array.from({ length: 8 }).map((_, rIdx) =>
                Array.from({ length: 8 }).map((_, cIdx) => {
                  const row = flip ? 7 - rIdx : rIdx;
                  const col = flip ? 7 - cIdx : cIdx;
                  const dark = (row + col) % 2 === 1;
                  const piece = room.board[row][col];
                  const isSelected = selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
                  const isTarget = legalTargetsForSelected.some((m) => m.to.row === row && m.to.col === col);
                  const isSelectableSquare = !selectedSquare && selectableSquares.some((s) => s.row === row && s.col === col);

                  let bg = dark ? "bg-neutral-800" : "bg-neutral-900";
                  if (isSelected) bg = "bg-orange-500";
                  else if (isTarget) bg = "bg-green-700";
                  else if (isSelectableSquare) bg = "bg-neutral-700";

                  return (
                    <button
                      key={`${row}-${col}`}
                      onClick={() => dark && handleSquareClick(row, col)}
                      disabled={!dark || !isMyTurn}
                      className={`aspect-square flex items-center justify-center ${bg}`}
                    >
                      {piece && (
                        <div
                          className={`w-3/4 h-3/4 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                            piece.p === me ? myPieceColor : oppPieceColor
                          } ${piece.p === "player1" ? "text-white" : "text-black"}`}
                        >
                          {piece.k ? "♛" : ""}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {moves.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 mb-4 max-h-24 overflow-y-auto text-sm text-neutral-400">
                {moves.map((m) => (
                  <span key={m.id} className="mr-3">
                    {m.move_desc}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {room.status === "finished" && (
          <div className="text-center mt-4">
            <p className="text-3xl mb-4">{room.winner === me ? "🎉 You Won!" : "💀 You Lost"}</p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={() => router.push("/games/checkers")}
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