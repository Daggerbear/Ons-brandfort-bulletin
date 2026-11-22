// src/app/terms/page.js
"use client";
import LegalPage from "@/components/LegalPage";
import { TERMS_EN_A } from "@/lib/legal/termsEnA";
import { TERMS_EN_B } from "@/lib/legal/termsEnB";
import { TERMS_AF_A } from "@/lib/legal/termsAfA";
import { TERMS_AF_B } from "@/lib/legal/termsAfB";

const doc = {
  en: { ...TERMS_EN_A, sections: [...TERMS_EN_A.sections, ...TERMS_EN_B] },
  af: { ...TERMS_AF_A, sections: [...TERMS_AF_A.sections, ...TERMS_AF_B] },
};
const other = { href: "/privacy", en: "🔒 Read our Privacy Policy", af: "🔒 Lees ons Privaatheidsbeleid" };

export default function Terms() {
  return <LegalPage doc={doc} other={{ href: other.href, en: other.en, af: other.af }} />;
}
