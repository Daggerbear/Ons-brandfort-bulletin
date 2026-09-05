import { supabase } from "@/lib/supabase";

function getPreviousMonthKey() {
  const now = new Date();
  const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

const MEDALS = ["🥇", "🥈", "🥉"];
const PLACE_AF = ["1ste", "2de", "3de"];
const PLACE_EN = ["1st", "2nd", "3rd"];

export async function postRiddleWinnersForMonth(monthKeyInput) {
  const monthKey = monthKeyInput || getPreviousMonthKey();

  // Claim this month atomically. If it already exists, we're done — no duplicate.
  const { error: claimError } = await supabase
    .from("riddle_winners_log")
    .insert({ month_key: monthKey });

  if (claimError) {
    if (claimError.code === "23505") {
      return { created: false, reason: `Already posted for ${monthKey}.` };
    }
    return { created: false, reason: `Failed to claim month: ${claimError.message}` };
  }

  const { data: scores, error: scoresError } = await supabase
    .from("riddle_scores")
    .select("name, points")
    .eq("month_key", monthKey);

  if (scoresError) {
    return { created: false, reason: `Failed to load scores: ${scoresError.message}` };
  }

  if (!scores || scores.length === 0) {
    return { created: false, reason: `No scores recorded for ${monthKey}. Month marked as processed.` };
  }

  const totals = {};
  scores.forEach((row) => {
    totals[row.name] = (totals[row.name] || 0) + row.points;
  });

  // Group by score value so ties share a placement, take top 3 distinct score groups
  const byScore = {};
  Object.entries(totals).forEach(([name, points]) => {
    if (!byScore[points]) byScore[points] = [];
    byScore[points].push(name);
  });
  const sortedScores = Object.keys(byScore)
    .map(Number)
    .sort((a, b) => b - a)
    .slice(0, 3);

  const monthLabel = formatMonthLabel(monthKey);
  const linesAf = [];
  const linesEn = [];

  sortedScores.forEach((points, i) => {
    const names = byScore[points].join(", ");
    linesAf.push(`${MEDALS[i]} ${PLACE_AF[i]}: ${names} (${points} pte)`);
    linesEn.push(`${MEDALS[i]} ${PLACE_EN[i]}: ${names} (${points} pts)`);
  });

  const content =
    `🏆 Riddle Rush — ${monthLabel} Wenners! 🏆\n\n` +
    linesAf.join("\n") +
    `\n\nBaie geluk aan almal! Speel elke dag by Glitch Cafe → /games/riddle-rush\n\n` +
    `— — —\n\n` +
    `🏆 Riddle Rush — ${monthLabel} Winners! 🏆\n\n` +
    linesEn.join("\n") +
    `\n\nCongratulations to everyone! Play daily at Glitch Cafe → /games/riddle-rush`;

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({
      name: "Ons Brandfort Bulletin",
      content,
      category: "Announcement",
      likes: 0,
      flag_count: 0,
      is_hidden: false,
    })
    .select()
    .single();

  if (postError) {
    return { created: false, reason: `Failed to create post: ${postError.message}` };
  }

  await supabase
    .from("riddle_winners_log")
    .update({ post_id: post.id })
    .eq("month_key", monthKey);

  return { created: true, monthKey, postId: post.id };
}