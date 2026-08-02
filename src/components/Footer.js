import Link from "next/link";

export default function Footer({ lang }) {
  const text = {
    af: {
      terms: "Bepalings & Voorwaardes",
      privacy: "Privaatheidsbeleid",
      built: "Gebou deur Jaco du Plessis — vir Brandfort, deur Brandfort.",
    },
    en: {
      terms: "Terms & Conditions",
      privacy: "Privacy Policy",
      built: "Built by Jaco du Plessis — for Brandfort, by Brandfort.",
    },
  };
  const t = text[lang] || text.af;

  return (
    <footer className="border-t border-neutral-800 px-6 py-8 text-center text-neutral-500 text-sm">
      <div className="flex justify-center gap-4 mb-3">
        <Link href="/terms" className="hover:text-orange-400 underline">
          {t.terms}
        </Link>
        <Link href="/privacy" className="hover:text-orange-400 underline">
          {t.privacy}
        </Link>
      </div>
      <p>{t.built}</p>
    </footer>
  );
}