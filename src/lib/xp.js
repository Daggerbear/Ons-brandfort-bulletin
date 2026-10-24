// src/lib/xp.js
// Display-only level math. The real XP total always comes from the database ledger.
// Change the curve here in one place. Level 2 = 100 XP, 3 = 300, 4 = 600, 5 = 1000...

export const MAX_LEVEL = 99;

// Total XP needed to reach a level (level 1 needs 0)
export function xpToReach(level) {
  return 50 * level * (level - 1);
}

export function levelFromXp(totalXp) {
  const xp = Math.max(0, Math.floor(Number(totalXp) || 0));
  let level = 1;
  while (level < MAX_LEVEL && xp >= xpToReach(level + 1)) level += 1;

  const floor = xpToReach(level);
  const atMax = level >= MAX_LEVEL;
  const next = atMax ? floor + 1 : xpToReach(level + 1);
  const span = next - floor;
  const into = atMax ? span : xp - floor;

  return { level, xp, into, span, progress: Math.min(1, into / span) };
}
