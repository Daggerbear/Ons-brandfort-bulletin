"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import GameSponsorBanner from "@/components/GameSponsorBanner";

const DIFFICULTY_REMOVALS = {
  easy: 35,
  medium: 45,
  hard: 55,
};

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateSolvedGrid() {
  const grid = Array.from({ length: 9 }, () => Array(9).fill(0));

  function isValid(g, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (g[row][i] === num || g[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (g[boxRow + r][boxCol + c] === num) return false;
      }
    }
    return true;
  }

  function fill(pos) {
    if (pos === 81) return true;
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const num of nums) {
      if (isValid(grid, row, col, num)) {
        grid[row][col] = num;
        if (fill(pos + 1)) return true;
        grid[row][col] = 0;
      }
    }
    return false;
  }

  fill(0);
  return grid;
}

function makePuzzle(solved, removals) {
  const puzzle = solved.map((row) => [...row]);
  const cells = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9])
  );
  for (let i = 0; i < removals; i++) {
    const [r, c] = cells[i];
    puzzle[r][c] = 0;
  }
  return puzzle;
}

function newGame(difficulty) {
  const solved = generateSolvedGrid();
  const puzzle = makePuzzle(solved, DIFFICULTY_REMOVALS[difficulty]);
  return { solved, puzzle };
}

export default function Sudoku() {
  const [difficulty, setDifficulty] = useState("easy");
  const [game, setGame] = useState(null);
  const [board, setBoard] = useState(null);
  const [selected, setSelected] = useState(null);
  const [won, setWon] = useState(false);
  const [errors, setErrors] = useState({});

  const startNewGame = useCallback((diff) => {
    const g = newGame(diff);
    setGame(g);
    setBoard(g.puzzle.map((row) => [...row]));
    setSelected(null);
    setWon(false);
    setErrors({});
  }, []);

  useEffect(() => {
    startNewGame("easy");
  }, [startNewGame]);

  function handleDifficultyChange(diff) {
    setDifficulty(diff);
    startNewGame(diff);
  }

  function isGivenCell(row, col) {
    return game.puzzle[row][col] !== 0;
  }

  function handleNumberInput(num) {
    if (!selected || won) return;
    const [row, col] = selected;
    if (isGivenCell(row, col)) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = num;
    setBoard(newBoard);

    const key = `${row},${col}`;
    const newErrors = { ...errors };
    if (num !== 0 && num !== game.solved[row][col]) {
      newErrors[key] = true;
    } else {
      delete newErrors[key];
    }
    setErrors(newErrors);

    const isComplete = newBoard.every((r) => r.every((cell) => cell !== 0));
    const noErrors = Object.keys(newErrors).length === 0;
    if (isComplete && noErrors) {
      const allCorrect = newBoard.every((r, ri) =>
        r.every((cell, ci) => cell === game.solved[ri][ci])
      );
      if (allCorrect) setWon(true);
    }
  }

  if (!game || !board) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-neutral-500">Loading puzzle...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10 flex flex-col items-center">
      <h1
        className="text-3xl font-black text-center mb-1 tracking-widest uppercase"
        style={{
          background: "linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Sudoku
      </h1>

      <div className="flex gap-2 my-4">
        {["easy", "medium", "hard"].map((diff) => (
          <button
            key={diff}
            onClick={() => handleDifficultyChange(diff)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase transition ${
              difficulty === diff
                ? "bg-purple-600 text-white"
                : "bg-neutral-900 border border-neutral-700 text-neutral-400"
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {won && (
        <div className="text-center mb-4">
          <p className="text-2xl mb-3">🎉 Solved!</p>
          <button
            onClick={() => startNewGame(difficulty)}
            className="bg-cyan-500 hover:bg-cyan-400 transition text-black font-bold rounded-lg px-6 py-3 uppercase"
          >
            Next Puzzle
          </button>
        </div>
      )}

      <div
        className="grid border-2 border-purple-500"
        style={{ gridTemplateColumns: "repeat(9, 1fr)", width: "min(90vw, 400px)" }}
      >
        {board.map((row, ri) =>
          row.map((cell, ci) => {
            const key = `${ri},${ci}`;
            const given = isGivenCell(ri, ci);
            const isSelected = selected && selected[0] === ri && selected[1] === ci;
            const hasError = errors[key];
            const thickRight = ci === 2 || ci === 5;
            const thickBottom = ri === 2 || ri === 5;

            return (
              <button
                key={key}
                onClick={() => !given && !won && setSelected([ri, ci])}
                className={`aspect-square flex items-center justify-center text-lg font-semibold border border-neutral-800
                  ${given ? "bg-neutral-900 text-neutral-300" : "bg-neutral-950 text-cyan-400"}
                  ${isSelected ? "bg-purple-900" : ""}
                  ${hasError ? "text-red-500" : ""}
                  ${thickRight ? "border-r-2 border-r-purple-500" : ""}
                  ${thickBottom ? "border-b-2 border-b-purple-500" : ""}
                `}
              >
                {cell !== 0 ? cell : ""}
              </button>
            );
          })
        )}
      </div>

      {!won && (
        <div className="grid grid-cols-5 gap-2 mt-6" style={{ width: "min(90vw, 400px)" }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberInput(num)}
              className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-lg font-bold hover:bg-purple-900 transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumberInput(0)}
            className="aspect-square bg-neutral-900 border border-neutral-700 rounded-lg text-sm hover:bg-red-900 transition"
          >
            ✕
          </button>
        </div>
      )}

      <GameSponsorBanner gameSlug="sudoku" />

      <Link href="/games" className="text-neutral-600 hover:text-white underline mt-10 text-sm">
        ← Back to Game Room
      </Link>
    </main>
  );
}