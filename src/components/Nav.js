export default function Nav({ lang }) {
  const text = {
    af: {
      home: "Tuisblad",
      business: "Lys Besigheid",
      event: "Lys Gebeurtenis",
      vra: "Brandfort Vra",
      lostFound: "Verlore & Gevind",
      shoutouts: "Shoutouts",
      emergency: "Nood Kontakte",
    },
    en: {
      home: "Home",
      business: "List Business",
      event: "List Event",
      vra: "Ask Brandfort",
      lostFound: "Lost & Found",
      shoutouts: "Shoutouts",
      emergency: "Emergency",
    },
  };
  const t = text[lang] || text.af;

  return (
    <nav className="flex flex-wrap justify-center gap-6 py-4 border-b border-neutral-800 bg-neutral-950 text-sm">
      <a href="/" className="text-neutral-300 hover:text-orange-400 transition">
        {t.home}
      </a>
      <a href="/list-your-business" className="text-neutral-300 hover:text-orange-400 transition">
        {t.business}
      </a>
      <a href="/list-your-event" className="text-neutral-300 hover:text-orange-400 transition">
        {t.event}
      </a>
      <a href="/brandfort-vra" className="text-neutral-300 hover:text-orange-400 transition">
        {t.vra}
      </a>
      <a href="/lost-found" className="text-neutral-300 hover:text-orange-400 transition">
        {t.lostFound}
      </a>
      <a href="/shoutouts" className="text-neutral-300 hover:text-orange-400 transition">
        {t.shoutouts}
      </a>
      <a href="/emergency" className="text-neutral-300 hover:text-orange-400 transition">
        {t.emergency}
      </a>
    </nav>
  );
}