"use client";
import { useState } from "react";
import Link from "next/link";

const GRID_SIZE = 6;
const SHIP_CELLS_NEEDED = 7;

function randomShipPlacement() {
  const cells = [];
  while (cells.length < SHIP_CELLS_NEEDED) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    const key = `${x},${y}`;
    if (!cells.includes(key)) cells.push(key);
  }
  return cells;
}

function key(x, y) {
  return `${x},${y}`;
}

function neighbors(x, y) {
  return [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ].filter(([nx, ny]) => nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE);
}

export default function BattleshipVsAi() {
  const [phase, setPhase] = useState("placing"); // placing, playing, finished
  const [selectedCells, setSelectedCells] = useState([]);
  const [myShips, setMyShips] = useState([]);
  const [aiShips, setAiShips] = useState([]);
  const [myShots, setMyShots] = useState({}); // key -> hit boolean
  const [aiShots, setAiShots] = useState({});
  const [turn, setTurn] = useState("player");
  const [winner, setWinner] = useState(null);
  const [aiTargetQueue, setAiTargetQueue] = useState([]);

  function toggleCell(x, y) {
    const k = key(x, y);
    setSelectedCells((prev) => {
      const exists = prev.includes(k);
      if (exists) return prev.filter((c) => c !== k);
      if (prev.length >= SHIP_CELLS_NEEDED) return prev;
      return [...prev, k];
    });
  }

  function confirmPlacement() {
    if (selectedCells.length !== SHIP_CELLS_NEEDED) return;
    setMyShips(selectedCells);
    setAiShips(randomShipPlacement());
    setPhase("playing");
    setTurn("player");
  }

  function fireAt(x, y) {
    if (turn !== "player" || phase !== "playing") return;
    const k = key(x, y);
    if (myShots[k] !== undefined) return;

    const hit = aiShips.includes(k);
    const newMyShots = { ...myShots, [k]: hit };
    setMyShots(newMyShots);

    const totalHits = Object.values(newMyShots).filter(Boolean).length;
    if (totalHits >= SHIP_CELLS_NEEDED) {
      setWinner("player");
      setPhase("finished");
      return;
    }

    setTurn("ai");
    setTimeout(() => aiTurn(newMyShots), 600);
  }

  function aiTurn(currentMyShots) {
    let x, y;

    // If we have queued targets from a previous hit, use those first
    let queue = [...aiTargetQueue];
    let picked = null;

    while (queue.length > 0) {
      const candidate = queue.shift();
      const [cx, cy] = candidate.split(",").map(Number);
      if (aiShots[candidate] === undefined) {
        picked = candidate;
        break;
      }
    }

    if (picked) {
      [x, y] = picked.split(",").map(Number);
    } else {
      // Random shot
      do {
        x = Math.floor(Math.random() * GRID_SIZE);
        y = Math.floor(Math.random() * GRID_SIZE);
      } while (aiShots[key(x, y)] !== undefined);
    }

    const k = key(x, y);
    const hit = myShips.includes(k);
    const newAiShots = { ...aiShots, [k]: hit };
    setAiShots(newAiShots);

    let newQueue = queue;
    if (hit) {
      const newTargets = neighbors(x, y)
        .map(([nx, ny]) => key(nx, ny))
        .filter((nk) => aiShots[nk] === undefined && !newQueue.includes(nk));
      newQueue = [...newQueue, ...newTargets];
    }
    setAiTargetQueue(newQueue);

    const totalHits = Object.values(newAiShots).filter(Boolean).length;
    if (totalHits >= SHIP_CELLS_NEEDED) {
      setWinner("ai");
      setPhase("finished");
      return;
    }

    setTurn("player");
  }

  function resetGame() {
    setPhase("placing");
    setSelectedCells([]);
    setMyShips([]);
    setAiShips([]);
    setMyShots({});
    setAiShots({});
    setTurn("player");
    setWinner(null);
    setAiTargetQueue([]);
  }

  const myShipsRemaining = SHIP_CELLS_NEEDED - Object.entries(aiShots).filter(([k, hit]) => hit && myShips.includes(k)).length;
  const aiShipsRemaining = SHIP_CELLS_NEEDED - Object.values(myShots).filter(Boolean).length;

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-1">
          <Link href="/games/battleship" className="text-sm text-neutral-500 hover:text-orange-400">
            ← Leave
          </Link>
          <h1 className="text-2xl font-bold">🚢 Battleship vs AI</h1>
          <div className="w-10" />
        </div>

        {phase === "placing" && (
          <div>
            <p className="text-neutral-400 text-center text-sm mb-4">
              Click {SHIP_CELLS_NEEDED} cells to place your ships ({selectedCells.length}/{SHIP_CELLS_NEEDED})
            </p>
            <div
              className="grid gap-1 mx-auto mb-4"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, maxWidth: "320px" }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const k = key(x, y);
                const selected = selectedCells.includes(k);
                return (
                  <button
                    key={k}
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
          </div>
        )}

        {phase === "playing" && (
          <div>
            <p className="text-center mb-2 font-semibold">
              {turn === "player" ? (
                <span className="text-green-400">Your turn!</span>
              ) : (
                <span className="text-neutral-400">AI is thinking...</span>
              )}
            </p>

            <div className="flex justify-center gap-6 mb-4 text-sm text-neutral-400">
              <span>🚢 You: {myShipsRemaining}/{SHIP_CELLS_NEEDED}</span>
              <span>🚢 AI: {aiShipsRemaining}/{SHIP_CELLS_NEEDED}</span>
            </div>

            <p className="text-sm text-neutral-400 text-center mb-2">Fire at AI's board:</p>
            <div
              className="grid gap-1 mx-auto mb-6"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, maxWidth: "320px" }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const k = key(x, y);
                const shot = myShots[k];
                let cellClass = "bg-neutral-800 hover:bg-neutral-700";
                if (shot !== undefined) cellClass = shot ? "bg-red-600" : "bg-neutral-600";
                return (
                  <button
                    key={k}
                    onClick={() => fireAt(x, y)}
                    disabled={turn !== "player" || shot !== undefined}
                    className={`aspect-square rounded ${cellClass}`}
                  >
                    {shot !== undefined ? (shot ? "💥" : "•") : ""}
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-neutral-400 text-center mb-2">AI's shots on you:</p>
            <div
              className="grid gap-1 mx-auto"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, maxWidth: "320px" }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const x = i % GRID_SIZE;
                const y = Math.floor(i / GRID_SIZE);
                const k = key(x, y);
                const shot = aiShots[k];
                let cellClass = "bg-neutral-900";
                if (shot !== undefined) cellClass = shot ? "bg-red-800" : "bg-neutral-700";
                return (
                  <div
                    key={k}
                    className={`aspect-square rounded flex items-center justify-center text-xs ${cellClass}`}
                  >
                    {shot !== undefined ? (shot ? "💥" : "•") : ""}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {phase === "finished" && (
          <div className="text-center">
            <p className="text-3xl mb-4">{winner === "player" ? "🎉 You Won!" : "💀 You Lost"}</p>
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