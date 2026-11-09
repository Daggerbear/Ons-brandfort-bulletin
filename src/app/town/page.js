// src/app/town/page.js
"use client";
import Link from "next/link";
import TownCard from "@/components/TownCard";
import { useLang } from "@/components/LangProvider";

export default function TownPage() {
  const { lang } = useLang();
  return (
    <main className="min-h-screen bg-black px-6 py-8 text-white">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-orange-400 hover:text-orange-300">
          {lang === "af" ? "← Terug na die Bulletin" : "← Back to the Bulletin"}
        </Link>
        <div className="mt-6">
          <TownCard lang={lang} />
        </div>
      </div>
    </main>
  );
}
