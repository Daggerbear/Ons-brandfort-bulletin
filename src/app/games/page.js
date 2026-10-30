// src/app/games/page.js
import { supabase } from "@/lib/supabase";
import GamesHub from "@/components/GamesHub";

export const metadata = {
  title: "Glitch Cafe — Speletjies",
  description:
    "Speel gratis speletjies teen vriende of alleen — Battleship, Chess, Sudoku, Checkers, Riddle Rush en meer, almal in Brandfort se Glitch Cafe.",
  alternates: {
    canonical: "/games",
  },
  openGraph: {
    title: "Glitch Cafe | Ons Brandfort Bulletin",
    description: "Speel gratis speletjies teen vriende of alleen — almal in een plek.",
    url: "/games",
  },
};
export const dynamic = "force-dynamic";

export default async function GamesPage() {
  const { data: images } = await supabase
    .from("site_images")
    .select("key, url")
    .in("key", ["games_hero", "games_logo"]);

  const heroUrl = images?.find((i) => i.key === "games_hero")?.url || null;
  const logoUrl = images?.find((i) => i.key === "games_logo")?.url || null;

  return <GamesHub heroUrl={heroUrl} logoUrl={logoUrl} />;
}