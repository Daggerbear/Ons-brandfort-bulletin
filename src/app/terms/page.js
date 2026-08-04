"use client";
import { useState } from "react";
import Nav from "@/components/Nav";

export default function Terms() {
  const [lang, setLang] = useState("af");

  const text = {
    af: {
      title: "Bepalings en Voorwaardes",
      updated: "Laas opgedateer: Augustus 2026",
      sections: [
        {
          h: "1. Oor Ons Brandfort Bulletin",
          p: [
            "Ons Brandfort Bulletin is 'n gratis, gemeenskapsgebaseerde platform vir die dorp Brandfort, geskep en bedryf deur Jaco du Plessis as 'n eenmansaak. Deur hierdie webwerf te gebruik, stem jy in tot hierdie bepalings.",
          ],
        },
        {
          h: "2. Wie Kan Die Webwerf Gebruik",
          p: [
            "Enigeen kan die webwerf besoek en inhoud lees. Om plasings te maak (Gemeenskap Feed, kommentare, besigheidslysings, gebeurtenisse) moet jy 'n regte naam en, waar van toepassing, geldige kontakbesonderhede verskaf.",
          ],
        },
        {
          h: "3. Gemeenskap Feed en Plasings",
          p: [
            "Die Gemeenskap Feed is bedoel vir persoonlike, nie-kommersiële gebruik — vrae, verlore/gevind items, aankondigings, shoutouts, en dies meer.",
            "Besighede mag NIE gratis plasings gebruik om hul besigheid, produkte, of dienste te adverteer nie. Besigheidsadvertensies is slegs beskikbaar deur die betaalde Geborgde Plasings of Besigheid Carousel geleenthede. Kontak ons vir pryse.",
            "Ons behou die reg voor om enige plasing te verwyder wat nie aan hierdie reëls voldoen nie, sonder vooraf kennisgewing, na goeddunke van die administrateur.",
          ],
        },
        {
          h: "4. Inhoud en Verantwoordelikheid",
          p: [
            "Gebruikers is self verantwoordelik vir enige inhoud wat hulle plaas. Ons Brandfort Bulletin verifieer nie die akkuraatheid van gebruikersinhoud nie (bv. verlore/gevind items, besigheidsbeskrywings, kommentare) en aanvaar geen aanspreeklikheid vir foutiewe, misleidende, of ongepaste inhoud wat deur gebruikers geplaas word nie.",
            "Gebruik die 🚩 Rapporteer-funksie om ongepaste inhoud aan ons uit te wys. Plasings word outomaties verberg na 3 rapporte, en word deur die administrateur hersien.",
          ],
        },
        {
          h: "5. Koop & Verkoop en Werk",
          p: [
            "Die Koop & Verkoop en Werk afdelings is platforms waar gebruikers direk met mekaar kan skakel via WhatsApp. Ons Brandfort Bulletin is nie 'n party tot enige transaksie, ooreenkoms, of aanstelling wat tussen gebruikers plaasvind nie, en fasiliteer geen betalings nie.",
            "Kopers en verkopers, en werkgewers en werksoekers, is self verantwoordelik om die geldigheid en veiligheid van enige transaksie of ooreenkoms te verseker. Ons aanvaar geen aanspreeklikheid vir verlies, skade, bedrog, of dispute wat uit sulke interaksies ontstaan nie.",
            "Dieselfde reëls in Afdeling 4 (Inhoud en Verantwoordelikheid) geld ook vir plasings in hierdie afdelings.",
          ],
        },
        {
          h: "6. Besigheidslysings en Adverteer",
          p: [
            "Basiese besigheidslysings is gratis. Uitgeligte plekke op die tuisblad-carousel en geborgde plasings in die feed is betaalde geleenthede. Pryse en beskikbaarheid kan verander sonder vooraf kennisgewing.",
            "Ons behou die reg voor om enige besigheidslysing te weier, wysig, of verwyder wat nie aan ons standaarde voldoen nie.",
          ],
        },
        {
          h: "7. Geen Waarborge Nie",
          p: [
            "Die webwerf word 'as is' verskaf. Ons waarborg nie ononderbroke toegang, foutlose werking, of dat inligting op die webwerf altyd op datum is nie.",
          ],
        },
        {
          h: "8. Wysigings",
          p: [
            "Ons kan hierdie bepalings te eniger tyd wysig. Voortgesette gebruik van die webwerf na wysigings beteken jy aanvaar die bygewerkte bepalings.",
          ],
        },
        {
          h: "9. Kontak Ons",
          p: [
            "Vir enige vrae oor hierdie bepalings, kontak Jaco du Plessis:",
            "WhatsApp: 060 366 1384",
            "E-pos: duplessisjaco978@gmail.com",
          ],
        },
      ],
    },
    en: {
      title: "Terms and Conditions",
      updated: "Last updated: August 2026",
      sections: [
        {
          h: "1. About Ons Brandfort Bulletin",
          p: [
            "Ons Brandfort Bulletin is a free, community-based platform for the town of Brandfort, created and operated by Jaco du Plessis as a sole proprietor. By using this website, you agree to these terms.",
          ],
        },
        {
          h: "2. Who Can Use The Website",
          p: [
            "Anyone can visit the website and read content. To make posts (Community Feed, comments, business listings, events) you must provide a real name and, where applicable, valid contact details.",
          ],
        },
        {
          h: "3. Community Feed and Posts",
          p: [
            "The Community Feed is intended for personal, non-commercial use — questions, lost/found items, announcements, shoutouts, and similar.",
            "Businesses may NOT use free posts to advertise their business, products, or services. Business advertising is only available through the paid Sponsored Posts or Business Carousel opportunities. Contact us for pricing.",
            "We reserve the right to remove any post that doesn't comply with these rules, without prior notice, at the administrator's discretion.",
          ],
        },
        {
          h: "4. Content and Responsibility",
          p: [
            "Users are solely responsible for any content they post. Ons Brandfort Bulletin does not verify the accuracy of user content (e.g. lost/found items, business descriptions, comments) and accepts no liability for incorrect, misleading, or inappropriate content posted by users.",
            "Use the 🚩 Report function to flag inappropriate content to us. Posts are automatically hidden after 3 reports, and reviewed by the administrator.",
          ],
        },
        {
          h: "5. Buy & Sell and Jobs",
          p: [
            "The Buy & Sell and Jobs sections are platforms where users can connect directly with each other via WhatsApp. Ons Brandfort Bulletin is not a party to any transaction, agreement, or hiring arrangement that takes place between users, and does not facilitate any payments.",
            "Buyers and sellers, and employers and job seekers, are solely responsible for ensuring the legitimacy and safety of any transaction or agreement. We accept no liability for loss, damage, fraud, or disputes arising from such interactions.",
            "The same rules in Section 4 (Content and Responsibility) also apply to posts in these sections.",
          ],
        },
        {
          h: "6. Business Listings and Advertising",
          p: [
            "Basic business listings are free. Featured spots on the homepage carousel and sponsored posts in the feed are paid opportunities. Prices and availability may change without prior notice.",
            "We reserve the right to refuse, edit, or remove any business listing that doesn't meet our standards.",
          ],
        },
        {
          h: "7. No Warranties",
          p: [
            "The website is provided 'as is'. We do not guarantee uninterrupted access, error-free operation, or that information on the website is always up to date.",
          ],
        },
        {
          h: "8. Changes",
          p: [
            "We may modify these terms at any time. Continued use of the website after changes means you accept the updated terms.",
          ],
        },
        {
          h: "9. Contact Us",
          p: [
            "For any questions about these terms, contact Jaco du Plessis:",
            "WhatsApp: 060 366 1384",
            "Email: duplessisjaco978@gmail.com",
          ],
        },
      ],
    },
  };

  const t = text[lang];

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <Nav lang={lang} />
      <div className="max-w-2xl mx-auto mt-8">
        <button
          onClick={() => setLang(lang === "af" ? "en" : "af")}
          className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition mb-8"
        >
          {lang === "af" ? "English" : "Afrikaans"}
        </button>

        <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
        <p className="text-neutral-500 text-sm mb-8">{t.updated}</p>

        <div className="space-y-6">
          {t.sections.map((s, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold text-orange-400 mb-2">{s.h}</h2>
              {s.p.map((para, j) => (
                <p key={j} className="text-neutral-300 leading-relaxed mb-2">
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>

        <a href="/" className="block text-center text-neutral-400 hover:text-white underline mt-10">
          {lang === "af" ? "Terug na Tuisblad" : "Back to Homepage"}
        </a>
      </div>
    </main>
  );
}