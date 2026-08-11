"use client";
import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Chess } from "chess.js";
import { supabase } from "@/lib/supabase";

const PIECE_SYMBOLS = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export default function ChessRoom() {
  const { roomcode } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const me = searchParams.get("as") || "player1";
  const opponent = me === "player1" ? "player2" : "player1";
  const myColor = me === "player1" ? "w" : "b";

  const [room, setRoom] = useState(null);
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchRoom = useCallback(async () => {
    const { data } = await supabase
      .from("chess_rooms")
      .select("*")
      .eq("room_code", roomcode.toUpperCase())
      .single();
    setRoom(data);
    setLoading(false);
  }, [roomcode]);

  const fetchMoves = useCallback(async () => {
    if (!room) return;
    const { data } = await supabase
      .from("chess_moves")
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
      .channel(`chess-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chess_rooms", filter: `id=eq.${room.id}` },
        () => fetchRoom()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chess_moves", filter: `room_id=eq.${room.id}` },
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

  async function handleSquareClick(square) {
    if (!room || room.status !== "playing") return;

    const game = new Chess(room.fen);
    const isMyTurn = game.turn() === myColor;
    if (!isMyTurn) return;

    if (selectedSquare) {
      const legalMoves = game.moves({ square: selectedSquare, verbose: true });
      const target = legalMoves.find((m) => m.to === square);

      if (target) {
        await attemptMove(game, selectedSquare, square, target.promotion);
        setSelectedSquare(null);
        return;
      }

      const piece = game.get(square);
      if (piece && piece.color === myColor) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
      return;
    }

    const piece = game.get(square);
    if (piece && piece.color === myColor) {
      setSelectedSquare(square);
    }
  }

  async function attemptMove(game, from, to, needsPromotion) {
    const moveObj = { from, to };
    if (needsPromotion) moveObj.promotion = "q";

    const result = game.move(moveObj);
    if (!result) return;

    const newFen = game.fen();
    const turnAfter = game.turn() === "w" ? "player1" : "player2";

    let status = room.status;
    let winner = null;
    let resultText = null;

    if (game.isGameOver()) {
      status = "finished";
      if (game.isCheckmate()) {
        winner = me;
        resultText = "checkmate";
      } else if (game.isStalemate()) {
        resultText = "stalemate";
      } else {
        resultText = "draw";
      }
    }

    await supabase.from("chess_moves").insert({
      room_id: room.id,
      player: me,
      move_san: result.san,
      fen_after: newFen,
    });

    await supabase
      .from("chess_rooms")
      .update({ fen: newFen, current_turn: turnAfter, status, winner, result: resultText })
      .eq("id", room.id);

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
          <Link href="/games/chess" className="text-orange-400 underline">
            Back to Chess
          </Link>
        </div>
      </main>
    );
  }

  const myName = me === "player1" ? room.player1_name : room.player2_name;
  const opponentName = me === "player1" ? room.player2_name : room.player1_name;

  const game = room.status === "playing" || room.status === "finished" ? new Chess(room.fen) : null;
  const isMyTurn = game ? game.turn() === myColor : false;
  const inCheck = game ? game.inCheck() : false;

  const legalTargets = selectedSquare && game
    ? game.moves({ square: selectedSquare, verbose: true }).map((m) => m.to)
    : [];

  const boardRows = game ? game.board() : null;
  const displayRows = myColor === "b" && boardRows ? [...boardRows].reverse().map((r) => [...r].reverse()) : boardRows;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-1">
          <Link href="/games/chess" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Leave
          </Link>
          <h1 className="text-2xl font-bold">♟️ Chess</h1>
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
                  <span className="text-green-400">Your turn!{inCheck ? " (Check!)" : ""}</span>
                ) : (
                  <span className="text-neutral-400">{opponentName}'s turn...</span>
                )
              ) : null}
            </p>

            <p className="text-center text-sm text-neutral-500 mb-4">
              You: {myName} ({myColor === "w" ? "White" : "Black"}) · {opponentName}: {opponentName ? (myColor === "w" ? "Black" : "White") : "..."}
            </p>

            <div
              className="grid gap-0 mx-auto mb-4 border-2 border-neutral-800"
              style={{ gridTemplateColumns: "repeat(8, 1fr)", maxWidth: "360px" }}
            >
              {displayRows &&
                displayRows.map((row, rowIdx) =>
                  row.map((cell, colIdx) => {
                    const actualRowIdx = myColor === "b" ? 7 - rowIdx : rowIdx;
                    const actualColIdx = myColor === "b" ? 7 - colIdx : colIdx;
                    const square = `${FILES[actualColIdx]}${8 - actualRowIdx}`;
                    const isLight = (rowIdx + colIdx) % 2 === 0;
                    const isSelected = selectedSquare === square;
                    const isLegalTarget = legalTargets.includes(square);

                    let bg = isLight ? "bg-neutral-700" : "bg-neutral-800";
                    if (isSelected) bg = "bg-orange-500";
                    else if (isLegalTarget) bg = isLight ? "bg-green-800" : "bg-green-900";

                    return (
                      <button
                        key={square}
                        onClick={() => handleSquareClick(square)}
                        disabled={room.status !== "playing"}
                        className={`aspect-square flex items-center justify-center text-2xl ${bg}`}
                      >
                        {cell ? PIECE_SYMBOLS[`${cell.color}${cell.type}`] : ""}
                      </button>
                    );
                  })
                )}
            </div>

            {moves.length > 0 && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 mb-4 max-h-32 overflow-y-auto text-sm text-neutral-400">
                {moves.map((m, i) => (
                  <span key={m.id} className="mr-2">
                    {i % 2 === 0 ? `${Math.floor(i / 2) + 1}.` : ""} {m.move_san}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {room.status === "finished" && (
          <div className="text-center mt-4">
            <p className="text-3xl mb-2">
              {room.result === "checkmate"
                ? room.winner === me
                  ? "🎉 You Won! (Checkmate)"
                  : "💀 You Lost (Checkmate)"
                : room.result === "stalemate"
                ? "🤝 Draw (Stalemate)"
                : "🤝 Draw"}
            </p>
            <div className="flex flex-col gap-3 items-center mt-4">
              <button
                onClick={() => router.push("/games/chess")}
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