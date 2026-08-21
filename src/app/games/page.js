import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export const dynamic = "force-dynamic";

const games = [
  {
    name: "🚢 Battleship",
    desc: "Play against a friend in real-time. No account needed.",
    href: "/games/battleship",
    color: "cyan",
  },
  {
    name: "♟️ Chess",
    desc: "Classic 1v1 chess. Play against a friend in real-time.",
    href: "/games/chess",
    color: "green",
  },
  {
    name: "🔢 Sudoku",
    desc: "Classic number puzzle. Three difficulty levels.",
    href: "/games/sudoku",
    color: "purple",
  },
  {
  name: "🔴 Checkers",
  desc: "Classic 1v1 checkers. Play against a friend in real-time.",
  href: "/games/checkers",
  color: "red",
},
  {
    name: "🧩 Riddle Rush",
    desc: "One riddle a day. 3 tries, monthly leaderboard.",
    href: "/games/riddle-rush",
    color: "pink",
  },
];

const colorMap = {
  cyan: "border-cyan-500 hover:shadow-cyan-500/50 text-cyan-400",
  purple: "border-purple-500 hover:shadow-purple-500/50 text-purple-400",
  pink: "border-pink-500 hover:shadow-pink-500/50 text-pink-400",
  green: "border-green-500 hover:shadow-green-500/50 text-green-400",
  red: "border-red-500 hover:shadow-red-500/50 text-red-400",
};

export default async function GamesHome() {
  const { data: images } = await supabase
    .from("site_images")
    .select("key, url")
    .in("key", ["games_hero", "games_logo"]);

  const heroUrl = images?.find((i) => i.key === "games_hero")?.url;
  const logoUrl = images?.find((i) => i.key === "games_logo")?.url;

  return (
    <main
      className="min-h-screen bg-black text-white px-6 py-12 relative overflow-hidden bg-cover bg-center bg-fixed"
      style={heroUrl ? { backgroundImage: `url(${heroUrl})` } : undefined}
    >
      {heroUrl && (
        <div className="absolute inset-0 bg-black/70 pointer-events-none" />
      )}

      {!heroUrl && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(168,85,247,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.15) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      )}

      <div className="max-w-md mx-auto relative">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt="Game Room"
            width={300}
            height={96}
            className="mx-auto mb-1 max-h-24 w-auto object-contain"
          />
        ) : (
          <h1
            className="text-4xl font-black text-center mb-1 tracking-widest uppercase"
            style={{
              background: "linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Game Room
          </h1>
        )}
        <p className="text-neutral-500 text-center text-sm mb-10 tracking-wide uppercase">
          Local Game Room 🕹️
        </p>

        <div className="space-y-4">
          {games.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className={`block bg-neutral-950/90 border-2 rounded-2xl p-6 transition shadow-lg hover:shadow-2xl ${colorMap[game.color]}`}
            >
              <h2 className="text-xl font-bold uppercase tracking-wide">{game.name}</h2>
              <p className="text-sm text-neutral-400 mt-2">{game.desc}</p>
            </Link>
          ))}

          <div className="border-2 border-dashed border-neutral-800 rounded-2xl p-6 text-center bg-black/40">
            <p className="text-neutral-600 text-sm uppercase tracking-wide">
              More games coming soon...
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="block text-center text-neutral-600 hover:text-white underline mt-12 text-sm"
        >
          ← Back to Bulletin
        </Link>
      </div>
    </main>
  );
}