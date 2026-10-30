// src/app/mission/page.js
"use client";
import { useLang } from "@/components/LangProvider";
import { useState } from "react";
import Link from "next/link";

export default function Mission() {
  const { lang } = useLang();

  const text = {
    af: {
      title: "Ons Visie & Missie",
      tagline: "Jou gemeenskap, in jou sak.",
      visionTitle: "Ons Visie",
      vision:
        "Ons wil hê Ons Brandfort Bulletin moet die eerste plek wees waar Brandfort kyk om te sien wat in die dorp aangaan — 'n plaaslike sosiale platform waar mense besighede kan vind, nuus en geleenthede kan deel en ontdek, kan koop en verkoop, werk kan soek of aanbied, behuising kan vind, en betrokke kan raak by hul gemeenskap.",
      missionTitle: "Ons Missie",
      mission:
        "Ons bou 'n gratis platform vir Brandfort waar mense plaaslike nuus, geleenthede, werk, goed te koop en ander belangrike dinge kan deel. Plaaslike besighede kan hul dienste wys sodat meer mense hulle kan vind en ondersteun. Die Bulletin is gebou vir Brandfort. Soos die platform groei en sy kostes kan dek, wil ons die geld terug in die dorp sit — deur meer mense na plaaslike besighede toe te stuur, en op die lang termyn hoop ons ook om nuwe, opkomende besighede in Brandfort te help begin en groei.",
      valuesTitle: "Waarvoor Ons Staan",
      values: [
        {
          title: "Altyd Gratis vir die Gemeenskap",
          desc: "Die kern van die Bulletin — besighede lys, gemeenskap feed, nood kontakte, en jou persoonlike rekening — bly vir altyd gratis vir elke inwoner van Brandfort.",
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
        {
          title: "Jou Inligting Is Joune",
          desc: "Ons verkoop nie jou inligting nie. Jou profiel is privaat, en jy kan enige tyd vra dat jou rekening verwyder word. Lees ons Privaatheidsbeleid vir die volle detail.",
        },
      ],
      freeTitle: "Vir Altyd Gratis",
      freeIntro:
        "Die volgende bly altyd gratis vir elke inwoner van Brandfort, sonder enige verskuilde koste:",
      freeItems: [
        "Besighede lys en deurblaai",
        "Gemeenskap feed — vrae, aankondigings, verlore & gevind",
        "Koop & verkoop advertensies",
        "Behuising — huur en te koop",
        "Werk — werkadvertensies en werksoekers",
        "Gebeurtenisse lys en bywoon",
        "Nood kontakte",
        "Lientjie, ons gratis ontvangsdame",
        "Persoonlike rekening en profiel (Google-aanmelding)",
        "Alle speletjies in Glitch Cafe",
      ],
      freeNote:
        "Binnekort: om iets te plaas (in die feed, koop & verkoop, behuising, werk, of om tellings in Glitch Cafe te stoor) sal jy 'n gratis rekening nodig hê. Blaai en speel bly oop vir almal. Teken nou in en kry jou plek reg!",
      comingTitle: "Wat Kom Nog",
      comingIntro: "Dinge waaraan ons werk, sonder om datums te belowe:",
      comingItems: [
        "Besigheidsrekeninge — 'n eie bladsy met meer beheer, 'n bestel-stelsel wat jy aan en af kan skakel, en insigte oor wat mense soek",
        "Daaglikse take, XP en vlakke vir die gemeenskap en Glitch Cafe",
        "Meer maniere om te gesels, te deel en betrokke te raak",
        "Stories van egte mense in Brandfort",
      ],
      comingNote:
        "Die kern bly gratis. As iets betalend gaan wees, sal ons dit vooraf duidelik sê.",
      adTitle: "Adverteer by Ons",
      adText:
        "Wil jou besigheid meer sigbaar wees op die Bulletin? Ons het opsies vir besighede wat uitgelig wil word. Dit verander soos die platform groei, so kontak Jaco vir die nuutste besonderhede en beskikbaarheid.",
      adButton: "Kontak Ons",
      aboutTitle: "Wie is Agter die Bulletin?",
      about:
        "Ons Brandfort Bulletin word gebou en bestuur deur Jaco du Plessis, 'n inwoner van Brandfort. Dit is nie 'n groot maatskappy of agentskap nie — net iemand wat hier woon, self leer programmeer, en die hele platform vanaf sy selfoon bou. Geen laptop, geen span nie, net 'n oortuiging dat Brandfort 'n plek soos hierdie verdien.",
      terms: "Bepalings",
      privacy: "Privaatheidsbeleid",
      back: "← Terug na Tuisblad",
    },
    en: {
      title: "Our Vision & Mission",
      tagline: "Your community, in your pocket.",
      visionTitle: "Our Vision",
      vision:
        "We want Ons Brandfort Bulletin to be the first place Brandfort looks to see what's happening in town — a local social platform where people can find businesses, share and discover news and events, buy and sell, find or offer work, find housing, and get involved in their community.",
      missionTitle: "Our Mission",
      mission:
        "We're building a free platform for Brandfort where people can share local news, events, jobs, items for sale, and other important things. Local businesses can showcase their services so more people can find and support them. The Bulletin is built for Brandfort. As the platform grows and can cover its costs, we want to put that money back into the town — by sending more people toward local businesses, and in the long run, we also hope to help new, up-and-coming businesses in Brandfort get started and grow.",
      valuesTitle: "What We Stand For",
      values: [
        {
          title: "Always Free for the Community",
          desc: "The core of the Bulletin — business listings, community feed, emergency contacts, and your personal account — stays free forever for every Brandfort resident.",
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
        {
          title: "Your Information Is Yours",
          desc: "We don't sell your information. Your profile is private, and you can ask for your account to be deleted at any time. Read our Privacy Policy for the full detail.",
        },
      ],
      freeTitle: "Forever Free",
      freeIntro:
        "The following stays free forever for every Brandfort resident, with no hidden costs:",
      freeItems: [
        "Browsing and listing businesses",
        "Community feed — questions, announcements, lost & found",
        "Buy & sell classifieds",
        "Housing — rentals and for sale",
        "Jobs — job ads and work seekers",
        "Listing and attending events",
        "Emergency contacts",
        "Lientjie, our free receptionist",
        "A personal account and profile (Google sign-in)",
        "Every game in Glitch Cafe",
      ],
      freeNote:
        "Coming soon: to post anything (in the feed, buy & sell, housing, jobs, or to save scores in Glitch Cafe) you'll need a free account. Browsing and playing stays open to everyone. Sign in now and get your spot sorted!",
      comingTitle: "What's Coming",
      comingIntro: "Things we're working on, with no dates promised:",
      comingItems: [
        "Business accounts — your own page with more control, an ordering system you can switch on and off, and insights into what people search for",
        "Daily quests, XP and levels for the community and Glitch Cafe",
        "More ways to chat, share and get involved",
        "Stories from real people in Brandfort",
      ],
      comingNote:
        "The core stays free. If something is going to be paid, we'll say so clearly beforehand.",
      adTitle: "Advertise With Us",
      adText:
        "Want your business to be more visible on the Bulletin? We have options for businesses that want to stand out. They change as the platform grows, so contact Jaco for the latest details and availability.",
      adButton: "Contact Us",
      aboutTitle: "Who's Behind the Bulletin?",
      about:
        "Ons Brandfort Bulletin is built and run by Jaco du Plessis, a resident of Brandfort. It's not a big company or agency — just someone who lives here, taught himself to code, and builds the entire platform from his phone. No laptop, no team, just a belief that Brandfort deserves a place like this.",
      terms: "Terms",
      privacy: "Privacy Policy",
      back: "← Back to Homepage",
    },
  };

  const t = text[lang];

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-neutral-800 px-6 py-10 text-center">
        
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
          <ul className="space-y-2 mb-4">
            {t.freeItems.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-neutral-300">
                <span className="text-green-400">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="bg-green-950/30 border border-green-500/30 rounded-xl p-4">
            <p className="text-sm text-neutral-200 leading-relaxed">🔑 {t.freeNote}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-orange-400 mb-3">{t.comingTitle}</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">{t.comingIntro}</p>
          <ul className="space-y-2 mb-4">
            {t.comingItems.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-neutral-300">
                <span className="text-orange-400">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-neutral-500 italic">{t.comingNote}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-orange-400 mb-3">{t.adTitle}</h2>
          <p className="text-neutral-300 leading-relaxed mb-4">{t.adText}</p>
          <Link
            href="/contact"
            className="inline-block bg-orange-500 hover:bg-orange-600 transition text-black font-semibold rounded-full px-5 py-2 text-sm"
          >
            {t.adButton}
          </Link>
        </div>

        <div>
          <h2 className="text-xl font-bold text-orange-400 mb-3">{t.aboutTitle}</h2>
          <p className="text-neutral-300 leading-relaxed">{t.about}</p>
        </div>

        <div className="flex justify-center gap-6 text-sm text-neutral-500">
          <Link href="/terms" className="underline hover:text-orange-400">
            {t.terms}
          </Link>
          <Link href="/privacy" className="underline hover:text-orange-400">
            {t.privacy}
          </Link>
        </div>

        <Link
          href="/"
          className="block text-center text-neutral-400 hover:text-white underline"
        >
          {t.back}
        </Link>
      </section>
    </main>
  );
}