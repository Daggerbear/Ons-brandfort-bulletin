export default function Nav({ lang }) {
  const text = {
    af: { home: "Tuisblad", business: "Lys Besigheid", event: "Lys Gebeurtenis" },
    en: { home: "Home", business: "List Business", event: "List Event" },
  };
  const t = text[lang] || text.af;

  return (
    <nav className="flex justify-center gap-6 py-4 border-b border-neutral-800 bg-neutral-950 text-sm">
      <a href="/" className="text-neutral-300 hover:text-orange-400 transition">
        {t.home}
      </a>
      <a href="/list-your-business" className="text-neutral-300 hover:text-orange-400 transition">
        {t.business}
      </a>
      <a href="/list-your-event" className="text-neutral-300 hover:text-orange-400 transition">
        {t.event}
      </a>
    </nav>
  );
}