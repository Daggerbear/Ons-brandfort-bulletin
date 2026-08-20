"use client";
import { useState } from "react";
import Link from "next/link";
import {
  createInitialBoard,
  getAllMovesForPlayer,
  applyMove,
  checkWinner,
} from "@/lib/checkersEngine";

function pickAiMove(board, player) {
  const moves = getAllMovesForPlayer(board, player);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

export default function CheckersVsAi() {
  const me = "player1";
  const ai = "player2";

  const [board, setBoard] = useState(createInitialBoard());
  const [turn, setTurn] = useState(me);
  const [forcedSquare, setForcedSquare] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [status, setStatus] = useState("playing"); // playing, finished
  const [winner, setWinner] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);

  const isMyTurn = status === "playing" && turn === me && !aiThinking;

  const allMoves = isMyTurn ? getAllMovesForPlayer(board, me, forcedSquare) : [];
  const legalTargetsForSelected = selectedSquare
    ? allMoves.filter((m) => m.from.row === selectedSquare.row && m.from.col === selectedSquare.col)
    : [];
  const selectableSquares = forcedSquare
    ? [forcedSquare]
    : [...new Set(allMoves.map((m) => `${m.from.row},${m.from.col}`))].map((s) => {
        const [row, col] = s.split(",").map(Number);
        return { row, col };
      });

  function handleSquareClick(row, col) {
    if (!isMyTurn) return;

    if (selectedSquare) {
      const move = legalTargetsForSelected.find((m) => m.to.row === row && m.to.col === col);
      if (move) {
        executeMove(move, me);
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

  function executeMove(move, player) {
    const newBoard = applyMove(board, move);
    const isCapture = !!move.captured;
    const opponent = player === me ? ai : me;

    let nextTurn = opponent;
    let nextForced = null;

    if (isCapture) {
      const continuation = getAllMovesForPlayer(newBoard, player, { row: move.to.row, col: move.to.col });
      if (continuation.length > 0) {
        nextTurn = player;
        nextForced = { row: move.to.row, col: move.to.col };
      }
    }

    setBoard(newBoard);
    setSelectedSquare(null);
    setForcedSquare(nextForced);

    if (nextTurn !== player) {
      const winnerCheck = checkWinner(newBoard, nextTurn);
      if (winnerCheck) {
        setStatus("finished");
        setWinner(winnerCheck);
        setTurn(nextTurn);
        return;
      }
    }

    setTurn(nextTurn);

    if (nextTurn === ai) {
      setAiThinking(true);
      setTimeout(() => runAiTurn(newBoard, nextForced), 600);
    }
  }

  function runAiTurn(currentBoard, currentForced) {
    const move = pickAiMove(currentBoard, ai);
    if (!move) {
      setStatus("finished");
      setWinner(me);
      setAiThinking(false);
      return;
    }

    const newBoard = applyMove(currentBoard, move);
    const isCapture = !!move.captured;

    let nextTurn = me;
    let nextForced = null;

    if (isCapture) {
      const continuation = getAllMovesForPlayer(newBoard, ai, { row: move.to.row, col: move.to.col });
      if (continuation.length > 0) {
        nextTurn = ai;
        nextForced = { row: move.to.row, col: move.to.col };
      }
    }

    setBoard(newBoard);
    setForcedSquare(nextForced);

    if (nextTurn !== ai) {
      const winnerCheck = checkWinner(newBoard, nextTurn);
      if (winnerCheck) {
        setStatus("finished");
        setWinner(winnerCheck);
        setTurn(nextTurn);
        setAiThinking(false);
        return;
      }
    }

    setTurn(nextTurn);

    if (nextTurn === ai) {
      setTimeout(() => runAiTurn(newBoard, nextForced), 600);
    } else {
      setAiThinking(false);
    }
  }

  function resetGame() {
    setBoard(createInitialBoard());
    setTurn(me);
    setForcedSquare(null);
    setSelectedSquare(null);
    setStatus("playing");
    setWinner(null);
    setAiThinking(false);
  }

  const myPieceColor = "bg-red-500 border-red-300";
  const aiPieceColor = "bg-neutral-100 border-neutral-400";

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-1">
          <Link href="/games/checkers" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Leave
          </Link>
          <h1 className="text-2xl font-bold">🔴 Checkers vs AI</h1>
          <div className="w-10" />
        </div>

        <p className="text-center mb-4 font-semibold">
          {status === "playing" ? (
            aiThinking ? (
              <span className="text-neutral-400">AI is thinking...</span>
            ) : isMyTurn ? (
              <span className="text-green-400">
                Your turn!{forcedSquare ? " Continue jumping!" : ""}
              </span>
            ) : (
              <span className="text-neutral-400">Waiting...</span>
            )
          ) : null}
        </p>

        <div
          className="grid gap-0 mx-auto mb-4 border-2 border-neutral-800"
          style={{ gridTemplateColumns: "repeat(8, 1fr)", maxWidth: "360px" }}
        >
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => {
              const dark = (row + col) % 2 === 1;
              const piece = board[row][col];
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
                        piece.p === me ? myPieceColor : aiPieceColor
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

        {status === "finished" && (
          <div className="text-center mt-4">
            <p className="text-3xl mb-4">{winner === me ? "🎉 You Won!" : "💀 You Lost"}</p>
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