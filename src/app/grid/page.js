// src/app/grid/page.js
"use client";
import Link from "next/link";
import { useLang } from "@/components/LangProvider";
import BrandfortGrid from "@/components/BrandfortGrid";

export default function GridPage() {
  const { lang } = useLang();
  const af = lang === "af";

  return (
    <main className="grid-screen" style={{ touchAction: "auto" }}>
      <div className="grid-panel mx-3 mt-3 flex items-center justify-between px-4 py-3">
        <Link href="/profile/hunter" className="text-sm text-cyan-300 hover:text-cyan-200">
          ← {af ? "Terug" : "Back"}
        </Link>
        <h1 className="text-sm font-black tracking-[0.25em] text-cyan-300">BRANDFORT GRID</h1>
        <span className="w-12" />
      </div>
      <BrandfortGrid lang={lang === "af" ? "af" : "en"} />
    </main>
  );
}