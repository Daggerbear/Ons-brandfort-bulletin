"use client";
import { useState } from "react";
import Nav from "@/components/Nav";
import Link from "next/link";

export default function Mission() {
  const [lang, setLang] = useState("af");

  const text = {
    af: {
      title: "Ons Visie & Missie",
      tagline: "Jou gemeenskap, in jou sak.",
      visionTitle: "Ons Visie",
      vision:
        "Ons wil hê Ons Brandfort Bulletin moet die eerste plek wees waar Brandfort kyk om te sien wat in die dorp aangaan. 'n Plek waar mense plaaslike besighede kan vind, aanbiedinge kan sien, werk of items te koop kan plaas, en op hoogte kan bly van wat in die dorp gebeur.",
      missionTitle: "Ons Missie",
      mission:
        "Ons bou 'n gratis platform vir Brandfort waar mense plaaslike nuus, geleenthede, werk, goed te koop en ander belangrike dinge kan deel. Plaaslike besighede kan hul dienste wys sodat meer mense hulle kan vind en ondersteun. Die Bulletin is gebou vir Brandfort. Soos die platform groei en sy kostes kan dek, wil ons die geld terug in die dorp sit — deur meer mense na plaaslike besighede toe te stuur, en op die lang termyn hoop ons ook om nuwe, opkomende besighede in Brandfort te help begin en groei.",
      valuesTitle: "Waarvoor Ons Staan",
      values: [
        {
          title: "Altyd Gratis vir die Gemeenskap",
          desc: "Die kern van die Bulletin — besighede lys, gemeenskap feed, nood kontakte — bly vir altyd gratis vir elke inwoner van Brandfort.",
        },
        {
          title: "Gebou Deur Brandfort, Vir Brandfort",
          desc: "Nie 'n groot maatskappy van buite nie — hierdie is 'n plaaslike projek, gebou deur iemand wat hier woon en die dorp se behoeftes verstaan.",
        },
        {
          title: "Eenvoud Bo Alles",
          desc: "Elke nuwe funksie moet een vraag deurstaan: maak dit die lewe van 'n Brandfort inwoner makliker? Indien nie, bly dit eenvoudig weg.",
        },
        {
          title: "Mobiel Eerste",
          desc: "Gebou vanaf 'n selfoon, vir selfone. Ons weet die meeste mense hier gebruik hul foon, nie 'n rekenaar nie — so alles is daarvoor ontwerp.",
        },
      ],
      freeTitle: "Vir Altyd Gratis",
      freeIntro:
        "Die volgende bly altyd gratis vir elke inwoner van Brandfort, sonder enige verskuilde koste:",
      freeItems: [
        "Besighede lys en deurblaai",
        "Gemeenskap feed — vrae, aankondigings, verlore & gevind",
        "Koop & verkoop advertensies",
        "Gebeurtenisse lys en bywoon",
        "Nood kontakte",
        "Alle speletjies in die Game Room",
      ],
      paidTitle: "Betalende Funksies",
      paidIntro:
        "Sommige opsionele funksies is betalend. Hier is presies wat dit kos en waarheen die geld gaan — vir volle deursigtigheid.",
      pricingTitle: "Pryse",
      pricing: [
        { label: "Aanlyn Spyskaart (per besigheid)", price: "R50 / maand" },
        { label: "Tuisblad Karussel of Speletjies Karussel", price: "R150 / maand" },
        { label: "\"Besit\" 'n Speletjie (een besigheid per speletjie)", price: "R250 / maand" },
      ],
      pricingNote:
        "Hierdie pryse help om die platform se koste te dek en om verder te bou aan iets wat vir die hele dorp werk. Ons hoop plaaslike besighede sien dit as 'n belegging in die gemeenskap, nie net 'n advertensie nie.",
      moneyTitle: "Waarheen Gaan die Geld?",
      moneyIntro: "Inkomste van betalende funksies word tussen drie dinge verdeel:",
      moneyUses: [
        "Die instandhouding en verbetering van die Bulletin self — hosting koste (Vercel en Supabase), nuwe funksies, en om alles vinnig en betroubaar te hou.",
        "'n Gedeelte gaan na Jaco, as vergoeding vir die tyd en werk wat in die bou en bestuur van die platform gaan.",
        "'n Gedeelte word herbelê in verdere plaaslike besigheidsprojekte, om oor tyd nog meer vir Brandfort te kan bou.",
      ],
      moneyNote:
        "Die presiese persentasies is nog nie finaal nie — sodra al die adverteer-plekke gevul is, sal ons dit hier bywerk vir volle deursigtigheid.",
      aboutTitle: "Wie is Agter die Bulletin?",
      about:
        "Ons Brandfort Bulletin word gebou en bestuur deur Jaco du Plessis, 'n inwoner van Brandfort. Dit is nie 'n groot maatskappy of agentskap nie — net iemand wat hier woon, self leer programmeer, en die hele platform vanaf sy selfoon bou. Geen laptop, geen span nie, net 'n oortuiging dat Brandfort 'n plek soos hierdie verdien.",
      back: "← Terug na Tuisblad",
    },
    en: {
      title: "Our Vision & Mission",
      tagline: "Your community, in your pocket.",
      visionTitle: "Our Vision",
      vision:
        "We want Ons Brandfort Bulletin to be the first place Brandfort looks to see what's happening in town. A place where people can find local businesses, see offers, post jobs or items for sale, and stay up to date with what's going on around town.",
      missionTitle: "Our Mission",
      mission:
        "We're building a free platform for Brandfort where people can share local news, events, jobs, items for sale, and other important things. Local businesses can showcase their services so more people can find and support them. The Bulletin is built for Brandfort. As the platform grows and can cover its costs, we want to put that money back into the town — by sending more people toward local businesses, and in the long run, we also hope to help new, up-and-coming businesses in Brandfort get started and grow.",
      valuesTitle: "What We Stand For",
      values: [
        {
          title: "Always Free for the Community",
          desc: "The core of the Bulletin — business listings, community feed, emergency contacts — stays free forever for every Brandfort resident.",
        },
        {
          title: "Built by Brandfort, for Brandfort",
          desc: "Not a big outside company — this is a local project, built by someone who lives here and understands the town's actual needs.",
        },
        {
          title: "Simplicity Above All",
          desc: "Every new feature has to pass one test: does it make life easier for a Brandfort resident? If not, it stays out.",
        },
        {
          title: "Mobile First",
          desc: "Built from a phone, for phones. We know most people here use their phone, not a computer — so everything is designed around that.",
        },
      ],
      freeTitle: "Forever Free",
      freeIntro:
        "The following stays free forever for every Brandfort resident, with no hidden costs:",
      freeItems: [
        "Browsing and listing businesses",
        "Community feed — questions, announcements, lost & found",
        "Buy & sell classifieds",
        "Listing and attending events",
        "Emergency contacts",
        "Every game in the Game Room",
      ],
      paidTitle: "Paid Features",
      paidIntro:
        "A few optional features are paid. Here's exactly what they cost and where the money goes — for full transparency.",
      pricingTitle: "Pricing",
      pricing: [
        { label: "Online Menu (per business)", price: "R50 / month" },
        { label: "Homepage Carousel or Games Carousel", price: "R150 / month" },
        { label: "\"Own\" a Game (one business per game)", price: "R250 / month" },
      ],
      pricingNote:
        "These prices help cover the platform's costs and fund building something that works for the whole town. We hope local businesses see it as an investment in the community, not just an ad.",
      moneyTitle: "Where Does the Money Go?",
      moneyIntro: "Income from paid features is split between three things:",
      moneyUses: [
        "Maintaining and improving the Bulletin itself — hosting costs (Vercel and Supabase), new features, and keeping everything fast and reliable.",
        "A portion goes to Jaco, as compensation for the time and work that goes into building and running the platform.",
        "A portion is reinvested into further local business projects, to keep building more for Brandfort over time.",
      ],
      moneyNote:
        "The exact percentages aren't finalized yet — once all the advertising spots are filled, we'll update this here for full transparency.",
      aboutTitle: "Who's Behind the Bulletin?",
      about:
        "Ons Brandfort Bulletin is built and run by Jaco du Plessis, a resident of Brandfort. It's not a big company or agency — just someone who lives here, taught himself to code, and builds the entire platform from his phone. No laptop, no team, just a belief that Brandfort deserves a place like this.",
      back: "← Back to Homepage",
    },
  };

  const t = text[lang];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Nav lang={lang} />

      <header className="border-b border-neutral-800 px-6 py-10 text-center">
        <div className="flex justify-end mb-4 max-w-2xl mx-auto">
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-orange-400 mt-2 text-lg">{t.tagline}</p>
      </header>

      <section className="px-6 py-10 max-w-2xl mx-auto space-y-10">
        <div>
          <h2 className="text-xl font-bold text-orange-400 mb-3">{t.visionTitle}</h2>
          <p className="text-neutral-300 leading-relaxed">{t.vision}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-orange-400 mb-3">{t.missionTitle}</h2>
          <p className="text-neutral-300 leading-relaxed">{t.mission}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-orange-400 mb-4">{t.valuesTitle}</h2>
          <div className="space-y-4">
            {t.values.map((v) => (
              <div
                key={v.title}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4"
              >
                <h3 className="font-semibold text-white mb-1">{v.title}</h3>
                <p className="text-sm text-neutral-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-green-400 mb-3">{t.freeTitle}</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">{t.freeIntro}</p>
          <ul className="space-y-2">
            {t.freeItems.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-neutral-300">
                <span className="text-green-400">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-bold text-orange-400 mb-3">{t.paidTitle}</h2>
          <p className="text-neutral-300 leading-relaxed mb-5">{t.paidIntro}</p>

          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-3">
            {t.pricingTitle}
          </h3>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mb-3">
            {t.pricing.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between items-center px-4 py-3 text-sm ${
                  i !== t.pricing.length - 1 ? "border-b border-neutral-800" : ""
                }`}
              >
                <span className="text-neutral-300">{row.label}</span>
                <span className="text-orange-400 font-semibold whitespace-nowrap ml-3">
                  {row.price}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed mb-6">{t.pricingNote}</p>

          <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wide mb-3">
            {t.moneyTitle}
          </h3>
          <p className="text-neutral-300 leading-relaxed mb-4">{t.moneyIntro}</p>
          <ul className="space-y-2 mb-4">
            {t.moneyUses.map((use) => (
              <li key={use} className="flex gap-2 text-sm text-neutral-300">
                <span className="text-orange-400">→</span>
                <span>{use}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-neutral-500 italic">{t.moneyNote}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-orange-400 mb-3">{t.aboutTitle}</h2>
          <p className="text-neutral-300 leading-relaxed">{t.about}</p>
        </div>

        <Link
          href="/"
          className="block text-center text-neutral-400 hover:text-white underline mt-8"
        >
          {t.back}
        </Link>
      </section>
    </main>
  );
}