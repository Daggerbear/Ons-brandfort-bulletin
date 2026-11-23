// src/app/terms/page.js
"use client";
import LegalPage from "@/components/LegalPage";
import { TERMS_EN } from "@/lib/legal/termsEn";
import { TERMS_AF } from "@/lib/legal/termsAf";

const doc = { en: TERMS_EN, af: TERMS_AF };
const other = { href: "/privacy", en: "🔒 Read our Privacy Policy", af: "🔒 Lees ons Privaatheidsbeleid" };

export default function Terms() {
  return <LegalPage doc={doc} other={other} />;
}
