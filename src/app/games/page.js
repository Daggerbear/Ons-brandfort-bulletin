import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import GamesCarousel from "@/components/GamesCarousel";

export const metadata = {
  title: "Glitch Cafe — Speletjies",
  description: "Speel gratis speletjies teen vriende of alleen — Battleship, Chess, Sudoku, Checkers, Riddle Rush en meer, almal in Brandfort se Glitch Cafe.",
  alternates: {
    canonical: "/games",
  },
  openGraph: {
    title: "Glitch Cafe | Ons Brandfort Bulletin",
    description: "Speel gratis speletjies teen vriende of alleen — almal in een plek.",
    url: "/games",
  },
}
export const dynamic = "force-dynamic";

const games = [
  {
    name: "Battleship",
    icon: "🚢",
    desc: "Real-time vs a friend.",
    href: "/games/battleship",
    color: "cyan",
  },
  {
    name: "Chess",
    icon: "♟️",
    desc: "Classic 1v1, real-time.",
    href: "/games/chess",
    color: "green",
  },
  {
    name: "Sudoku",
    icon: "🔢",
    desc: "3 difficulty levels.",
    href: "/games/sudoku",
    color: "purple",
  },
  {
    name: "Checkers",
    icon: "🔴",
    desc: "Classic 1v1, real-time.",
    href: "/games/checkers",
    color: "red",
  },
  {
    name: "Riddle Rush",
    icon: "🧩",
    desc: "Daily riddle, 3 tries.",
    href: "/games/riddle-rush",
    color: "pink",
  },
  {
    name: "Block Rush",
    icon: "🧱",
    desc: "Falling block puzzle.",
    href: "/games/block-rush",
    color: "cyan",
  },
  {
    name: "Whack-a-Mole",
    icon: "🔨",
    desc: "Tap the mole, beat the clock.",
    href: "/games/whack-a-mole",
    color: "purple",
  },
  {
    name: "Snake",
    icon: "🐍",
    desc: "Classic snake, swipe controls.",
    href: "/games/snake",
    color: "green",
  },
  {
    name: "Brick Breaker",
    icon: "🧱",
    desc: "Drag paddle, break bricks.",
    href: "/games/brick-breaker",
    color: "pink",
  },
  {
    name: "Merge Rush",
    icon: "🔢",
    desc: "Swipe to merge, reach 2048.",
    href: "/games/merge-rush",
    color: "cyan",
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
        <p className="text-neutral-500 text-center text-sm mb-8 tracking-wide uppercase">
          Local Game Room 🕹️
        </p>

        <GamesCarousel />

        <div className="grid grid-cols-2 gap-3">
          {games.map((game) => (
            <Link
              key={game.href}
              href={game.href}
              className={`bg-neutral-950/90 border-2 rounded-2xl p-4 transition shadow-lg hover:shadow-2xl flex flex-col items-center text-center gap-1 ${colorMap[game.color]}`}
            >
              <span className="text-3xl">{game.icon}</span>
              <h2 className="text-sm font-bold uppercase tracking-wide">{game.name}</h2>
              <p className="text-xs text-neutral-500">{game.desc}</p>
            </Link>
          ))}

          <div className="col-span-2 border-2 border-dashed border-neutral-800 rounded-2xl p-4 text-center bg-black/40">
            <p className="text-neutral-600 text-sm uppercase tracking-wide">
              More games coming soon...
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="block text-center text-neutral-600 hover:text-white underline mt-10 text-sm"
        >
          ← Back to Bulletin
        </Link>
      </div>
    </main>
  );
}