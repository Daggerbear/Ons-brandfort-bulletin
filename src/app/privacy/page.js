// src/app/privacy/page.js
"use client";
import LegalPage from "@/components/LegalPage";
import { PRIVACY_EN } from "@/lib/legal/privacyEn";
import { PRIVACY_AF } from "@/lib/legal/privacyAf";

const doc = { en: PRIVACY_EN, af: PRIVACY_AF };
const other = { href: "/terms", en: "📄 Read our Terms and Conditions", af: "📄 Lees ons Bepalings en Voorwaardes" };

export default function Privacy() {
  return <LegalPage doc={doc} other={other} />;
}
