// src/components/GamesHub.js
"use client";
import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import SafeImage from "@/components/SafeImage";
import GamesCarousel from "@/components/GamesCarousel";
import ListenLiveCard from "@/components/ListenLiveCard";
import { useLang } from "@/components/LangProvider";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const games = [
  { name: "Battleship", icon: "🚢", desc: { en: "Real-time vs a friend.", af: "Intyds teen 'n vriend." }, href: "/games/battleship", color: "cyan", group: "duel", badge: { en: "2P", af: "2S" } },
  { name: "Chess", icon: "♟️", desc: { en: "Classic 1v1, real-time.", af: "Klassieke 1v1, intyds." }, href: "/games/chess", color: "green", group: "duel", badge: { en: "2P", af: "2S" } },
  { name: "Checkers", icon: "🔴", desc: { en: "Classic 1v1, real-time.", af: "Klassieke 1v1, intyds." }, href: "/games/checkers", color: "red", group: "duel", badge: { en: "2P", af: "2S" } },
  { name: "Sudoku", icon: "🔢", desc: { en: "3 difficulty levels.", af: "3 moeilikheidsvlakke." }, href: "/games/sudoku", color: "purple", group: "puzzle" },
  { name: "Riddle Rush", icon: "🧩", desc: { en: "Daily riddle, 3 tries.", af: "Daaglikse raaisel, 3 pogings." }, href: "/games/riddle-rush", color: "pink", group: "puzzle", badge: { en: "DAILY", af: "DAAG" } },
  { name: "Merge Rush", icon: "🔢", desc: { en: "Swipe to merge, reach 2048.", af: "Swiep om saam te voeg, bereik 2048." }, href: "/games/merge-rush", color: "cyan", group: "puzzle" },
  { name: "Block Rush", icon: "🧱", desc: { en: "Falling block puzzle.", af: "Val-blok raaisel." }, href: "/games/block-rush", color: "cyan", group: "arcade" },
  { name: "Whack-a-Mole", icon: "🔨", desc: { en: "Tap the mole, beat the clock.", af: "Tik die mol, klop die horlosie." }, href: "/games/whack-a-mole", color: "purple", group: "arcade" },
  { name: "Snake", icon: "🐍", desc: { en: "Classic snake, swipe controls.", af: "Klassieke slang, swiep beheer." }, href: "/games/snake", color: "green", group: "arcade" },
  { name: "Brick Breaker", icon: "🧱", desc: { en: "Drag paddle, break bricks.", af: "Sleep die kolf, breek stene." }, href: "/games/brick-breaker", color: "pink", group: "arcade" },
  { name: "Idle Empire", icon: "🏘️", desc: { en: "Grow a town, even while away.", af: "Laat 'n dorp groei, selfs as jy weg is." }, href: "/games/idle-empire", color: "amber", group: "collect", badge: { en: "NEW", af: "NUUT" } },
  { name: "Hue Hoard", icon: "🎨", desc: { en: "Mix colours, fill your gallery.", af: "Meng kleure, vul jou galery." }, href: "/games/hue-hoard", color: "pink", group: "collect", badge: { en: "NEW", af: "NUUT" } },
  { name: "Merge & Collect", icon: "✨", desc: { en: "Merge items, complete the book.", af: "Voeg items saam, voltooi die boek." }, href: "/games/merge-collect", color: "cyan", group: "collect", badge: { en: "NEW", af: "NUUT" } },
];

const groups = [
  { key: "duel", title: { en: "VS A FRIEND", af: "TEEN 'N VRIEND" }, sub: { en: "real-time 1v1", af: "intyds 1v1" } },
  { key: "puzzle", title: { en: "PUZZLES", af: "RAAISELS" }, sub: { en: "take your time", af: "neem jou tyd" } },
  { key: "arcade", title: { en: "ARCADE", af: "ARCADE" }, sub: { en: "quick reflexes", af: "vinnige reflekse" } },
  { key: "collect", title: { en: "COLLECT", af: "VERSAMEL" }, sub: { en: "one more upgrade", af: "net nog een opgradering" } },
];

// Each colour gets a hard-edged border and a solid offset shadow, like a pixel sprite
const palette = {
  cyan: { c: "#22d3ee", s: "#0e7490" },
  purple: { c: "#c084fc", s: "#6b21a8" },
  pink: { c: "#f472b6", s: "#9d174d" },
  green: { c: "#4ade80", s: "#166534" },
  red: { c: "#f87171", s: "#991b1b" },
  amber: { c: "#fbbf24", s: "#92400e" },
};

const titleNode = (
  <h1
    className={`${pixel.className} text-center text-2xl leading-snug text-white`}
    style={{ textShadow: "3px 0 #f0abfc, -3px 0 #22d3ee, 0 4px 0 #000" }}
  >
    GLITCH
    <br />
    CAFE
  </h1>
);

export default function GamesHub({ heroUrl, logoUrl }) {
  const { lang } = useLang();
  const L = lang === "af" ? "af" : "en";

  const t = {
    en: { tagline: "LOCAL GAME ROOM", press: "PRESS START", count: (n) => `${n} GAMES • FREE`, soon: "MORE GAMES LOADING..." },
    af: { tagline: "PLAASLIKE SPELETJIEKAMER", press: "DRUK START", count: (n) => `${n} SPELETJIES • GRATIS`, soon: "MEER SPELETJIES LAAI..." },
  }[L];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0614] text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        {heroUrl && (
          <SafeImage src={heroUrl} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <div className={`absolute inset-0 ${heroUrl ? "bg-[#0b0614]/85" : "bg-[#0b0614]"}`} />
        {/* pixel grid */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "linear-gradient(#7c3aed 2px, transparent 2px), linear-gradient(90deg, #7c3aed 2px, transparent 2px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>
      {/* CRT scanlines */}
      <div
        className="pointer-events-none fixed inset-0 z-20 opacity-25"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.55) 0px, rgba(0,0,0,0.55) 1px, transparent 1px, transparent 3px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-md px-5 pb-28 pt-8">
        {/* Header */}
        <header className="mb-6 text-center">
          {logoUrl ? (
            <SafeImage
              src={logoUrl}
              alt="Glitch Cafe"
              width={300}
              height={96}
              priority
              className="mx-auto mb-2 max-h-24 w-auto object-contain [image-rendering:pixelated]"
              fallback={titleNode}
            />
          ) : (
            titleNode
          )}
          <p className={`${pixel.className} mt-4 text-[9px] leading-relaxed tracking-wider text-cyan-300`}>
            {t.tagline}
          </p>
          <p className={`${pixel.className} mt-4 animate-pulse text-[10px] text-yellow-300`}>
            ▶ {t.press} ◀
          </p>
          <div
            className={`${pixel.className} mt-4 inline-block border-4 border-fuchsia-400 bg-black px-3 py-2 text-[8px] text-fuchsia-300`}
            style={{ boxShadow: "4px 4px 0 0 #701a75" }}
          >
            {t.count(games.length)}
          </div>
        </header>

        {/* Radio */}
        <ListenLiveCard lang={L} />

        <GamesCarousel />

        {/* Grouped games */}
        {groups.map((group) => (
          <section key={group.key} className="mt-9">
            <div className="mb-3 flex items-end justify-between border-b-4 border-dashed border-white/20 pb-2">
              <h2 className={`${pixel.className} text-[11px] leading-tight text-white`}>
                ▶ {group.title[L]}
              </h2>
              <p className={`${pixel.className} text-[7px] text-neutral-400`}>{group.sub[L]}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {games
                .filter((g) => g.group === group.key)
                .map((game) => {
                  const p = palette[game.color];
                  return (
                    <Link
                      key={game.href}
                      href={game.href}
                      className="group relative flex flex-col items-center gap-2 bg-black p-3 text-center transition-transform active:translate-x-[3px] active:translate-y-[3px] last:odd:col-span-2"
                      style={{
                        border: `4px solid ${p.c}`,
                        boxShadow: `5px 5px 0 0 ${p.s}`,
                      }}
                    >
                      {game.badge && (
                        <span
                          className={`${pixel.className} absolute -right-2 -top-3 bg-yellow-300 px-1.5 py-1 text-[7px] text-black`}
                          style={{ boxShadow: "2px 2px 0 0 #000" }}
                        >
                          {game.badge[L]}
                        </span>
                      )}
                      <span className="mt-1 text-4xl [image-rendering:pixelated]">{game.icon}</span>
                      <h3
                        className={`${pixel.className} text-[9px] leading-snug`}
                        style={{ color: p.c }}
                      >
                        {game.name.toUpperCase()}
                      </h3>
                      <p className="font-mono text-[11px] leading-tight text-neutral-400">
                        {game.desc[L]}
                      </p>
                    </Link>
                  );
                })}
            </div>
          </section>
        ))}

        <div className="mt-10 border-4 border-dashed border-neutral-700 bg-black/60 p-4 text-center">
          <p className={`${pixel.className} text-[8px] leading-relaxed text-neutral-500`}>
            {t.soon}
          </p>
        </div>
      </div>
    </main>
  );
}
