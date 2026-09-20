// src/app/games/page.js
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import SafeImage from "@/components/SafeImage";
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
  { name: "Battleship", icon: "🚢", desc: "Real-time vs a friend.", href: "/games/battleship", color: "cyan", group: "duel", badge: "2 PLAYERS" },
  { name: "Chess", icon: "♟️", desc: "Classic 1v1, real-time.", href: "/games/chess", color: "green", group: "duel", badge: "2 PLAYERS" },
  { name: "Checkers", icon: "🔴", desc: "Classic 1v1, real-time.", href: "/games/checkers", color: "red", group: "duel", badge: "2 PLAYERS" },
  { name: "Sudoku", icon: "🔢", desc: "3 difficulty levels.", href: "/games/sudoku", color: "purple", group: "puzzle" },
  { name: "Riddle Rush", icon: "🧩", desc: "Daily riddle, 3 tries.", href: "/games/riddle-rush", color: "pink", group: "puzzle", badge: "DAILY" },
  { name: "Merge Rush", icon: "🔢", desc: "Swipe to merge, reach 2048.", href: "/games/merge-rush", color: "cyan", group: "puzzle" },
  { name: "Block Rush", icon: "🧱", desc: "Falling block puzzle.", href: "/games/block-rush", color: "cyan", group: "arcade" },
  { name: "Whack-a-Mole", icon: "🔨", desc: "Tap the mole, beat the clock.", href: "/games/whack-a-mole", color: "purple", group: "arcade" },
  { name: "Snake", icon: "🐍", desc: "Classic snake, swipe controls.", href: "/games/snake", color: "green", group: "arcade" },
  { name: "Brick Breaker", icon: "🧱", desc: "Drag paddle, break bricks.", href: "/games/brick-breaker", color: "pink", group: "arcade" },
];

const groups = [
  { key: "duel", title: "⚔️ Vs a Friend", sub: "Real-time 1v1" },
  { key: "puzzle", title: "🧠 Puzzles", sub: "Take your time" },
  { key: "arcade", title: "🎮 Arcade", sub: "Quick reflexes" },
];

// Full class names so Tailwind keeps them
const colorMap = {
  cyan: {
    card: "border-cyan-500/70 hover:border-cyan-400 hover:shadow-cyan-500/40 from-cyan-500/10",
    text: "text-cyan-400",
  },
  purple: {
    card: "border-purple-500/70 hover:border-purple-400 hover:shadow-purple-500/40 from-purple-500/10",
    text: "text-purple-400",
  },
  pink: {
    card: "border-pink-500/70 hover:border-pink-400 hover:shadow-pink-500/40 from-pink-500/10",
    text: "text-pink-400",
  },
  green: {
    card: "border-green-500/70 hover:border-green-400 hover:shadow-green-500/40 from-green-500/10",
    text: "text-green-400",
  },
  red: {
    card: "border-red-500/70 hover:border-red-400 hover:shadow-red-500/40 from-red-500/10",
    text: "text-red-400",
  },
};

const titleNode = (
  <h1
    className="text-5xl font-black text-center tracking-widest uppercase"
    style={{
      background: "linear-gradient(90deg, #22d3ee, #a855f7, #ec4899)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      filter: "drop-shadow(0 0 14px rgba(168,85,247,0.55))",
    }}
  >
    Glitch Cafe
  </h1>
);

export default async function GamesHome() {
  const { data: images } = await supabase
    .from("site_images")
    .select("key, url")
    .in("key", ["games_hero", "games_logo"]);

  const heroUrl = images?.find((i) => i.key === "games_hero")?.url;
  const logoUrl = images?.find((i) => i.key === "games_logo")?.url;

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {heroUrl && (
          <SafeImage
            src={heroUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className={`absolute inset-0 ${heroUrl ? "bg-black/70" : "bg-black"}`} />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(168,85,247,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-md mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-8">
          {logoUrl ? (
            <SafeImage
              src={logoUrl}
              alt="Glitch Cafe"
              width={300}
              height={96}
              priority
              className="mx-auto mb-2 max-h-24 w-auto object-contain"
              fallback={titleNode}
            />
          ) : (
            titleNode
          )}
          <p className="text-neutral-400 text-sm mt-2 tracking-wide uppercase">
            Local Game Room 🕹️
          </p>
          <div className="inline-flex items-center gap-2 mt-4 text-xs text-neutral-300 border border-purple-500/40 bg-purple-500/10 rounded-full px-3 py-1">
            🎮 {games.length} games · Free to play
          </div>
        </header>

        <GamesCarousel />

        {/* Grouped games */}
        {groups.map((group) => (
          <section key={group.key} className="mt-8">
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-black tracking-wide">{group.title}</h2>
              <p className="text-xs text-neutral-500 uppercase tracking-wide">{group.sub}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {games
                .filter((g) => g.group === group.key)
                .map((game) => (
                  <Link
                    key={game.href}
                    href={game.href}
                    className={`relative last:odd:col-span-2 bg-gradient-to-br to-neutral-950/90 border-2 rounded-2xl p-4 transition shadow-lg hover:shadow-2xl hover:scale-[1.02] flex flex-col items-center text-center gap-1 ${colorMap[game.color].card}`}
                  >
                    {game.badge && (
                      <span className="absolute top-2 right-2 text-[9px] font-bold tracking-wider bg-black/60 border border-neutral-700 text-neutral-300 rounded-full px-2 py-0.5">
                        {game.badge}
                      </span>
                    )}
                    <span className="text-4xl mt-1">{game.icon}</span>
                    <h3
                      className={`text-sm font-bold uppercase tracking-wide ${colorMap[game.color].text}`}
                    >
                      {game.name}
                    </h3>
                    <p className="text-xs text-neutral-400">{game.desc}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}

        <div className="mt-8 border-2 border-dashed border-neutral-800 rounded-2xl p-4 text-center bg-black/40">
          <p className="text-neutral-500 text-sm uppercase tracking-wide">
            More games coming soon...
          </p>
        </div>

        <Link
          href="/"
          className="block text-center text-neutral-500 hover:text-white underline mt-10 text-sm"
        >
          ← Back to Bulletin
        </Link>
      </div>
    </main>
  );
}