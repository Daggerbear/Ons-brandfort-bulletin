"use client";
import { useState } from "react";
import Link from "next/link";
import { Chess } from "chess.js";

const PIECE_SYMBOLS = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

// Simple move-picking: prefers captures, otherwise random legal move
function pickAiMove(game) {
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;

  const captures = moves.filter((m) => m.captured);
  const pool = captures.length > 0 ? captures : moves;

  return pool[Math.floor(Math.random() * pool.length)];
}

export default function ChessVsAi() {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [thinking, setThinking] = useState(false);
  const [fenTrigger, setFenTrigger] = useState(0);

  const myColor = "w";
  const isMyTurn = game.turn() === myColor && !thinking;
  const inCheck = game.inCheck();

  function refresh() {
    setFenTrigger((n) => n + 1);
  }

  function handleSquareClick(square) {
    if (!isMyTurn || game.isGameOver()) return;

    if (selectedSquare) {
      const legalMoves = game.moves({ square: selectedSquare, verbose: true });
      const target = legalMoves.find((m) => m.to === square);

      if (target) {
        const moveObj = { from: selectedSquare, to: square };
        if (target.promotion) moveObj.promotion = "q";
        game.move(moveObj);
        setSelectedSquare(null);
        refresh();

        if (!game.isGameOver()) {
          setThinking(true);
          setTimeout(() => {
            const aiMove = pickAiMove(game);
            if (aiMove) {
              game.move({ from: aiMove.from, to: aiMove.to, promotion: aiMove.promotion || "q" });
            }
            setThinking(false);
            refresh();
          }, 500);
        }
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

  function resetGame() {
    setGame(new Chess());
    setSelectedSquare(null);
    setThinking(false);
    refresh();
  }

  const legalTargets = selectedSquare
    ? game.moves({ square: selectedSquare, verbose: true }).map((m) => m.to)
    : [];

  const boardRows = game.board();

  let resultText = null;
  if (game.isGameOver()) {
    if (game.isCheckmate()) {
      resultText = game.turn() === myColor ? "💀 You Lost (Checkmate)" : "🎉 You Won! (Checkmate)";
    } else if (game.isStalemate()) {
      resultText = "🤝 Draw (Stalemate)";
    } else {
      resultText = "🤝 Draw";
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-1">
          <Link href="/games/chess" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Leave
          </Link>
          <h1 className="text-2xl font-bold">♟️ Chess vs AI</h1>
          <div className="w-10" />
        </div>

        <p className="text-center mb-4 font-semibold">
          {resultText ? null : thinking ? (
            <span className="text-neutral-400">AI is thinking...</span>
          ) : isMyTurn ? (
            <span className="text-green-400">Your turn!{inCheck ? " (Check!)" : ""}</span>
          ) : (
            <span className="text-neutral-400">Waiting...</span>
          )}
        </p>

        <div
          className="grid gap-0 mx-auto mb-4 border-2 border-neutral-800"
          style={{ gridTemplateColumns: "repeat(8, 1fr)", maxWidth: "360px" }}
        >
          {boardRows.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              const square = `${FILES[colIdx]}${8 - rowIdx}`;
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
                  disabled={!isMyTurn || !!resultText}
                  className={`aspect-square flex items-center justify-center text-2xl ${bg}`}
                >
                  {cell ? PIECE_SYMBOLS[`${cell.color}${cell.type}`] : ""}
                </button>
              );
            })
          )}
        </div>

        {resultText && (
          <div className="text-center mt-4">
            <p className="text-3xl mb-4">{resultText}</p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={resetGame}
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