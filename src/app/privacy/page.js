"use client";
import { useState } from "react";
import Nav from "@/components/Nav";

export default function Privacy() {
  const [lang, setLang] = useState("af");

  const text = {
    af: {
      title: "Privaatheidsbeleid",
      updated: "Laas opgedateer: Augustus 2026",
      sections: [
{
          h: "1. Wie Ons Is",
          p: [
            "Ons Brandfort Bulletin word bedryf deur Jaco du Plessis, as 'n eenmansaak in Brandfort, Vrystaat.",
            "Hierdie beleid gaan spesifiek oor hoe ons persoonlike inligting hanteer en beskerm, in ooreenstemming met die Suid-Afrikaanse Wet op Beskerming van Persoonlike Inligting (POPIA) — dit gaan nie oor die akkuraatheid van inhoud wat gebruikers self plaas nie (sien ons Bepalings & Voorwaardes vir daardie deel).",
            "As enige inligting oor jou verkeerd is (bv. in 'n besigheidslysing), is dit jou verantwoordelikheid om ons te kontak sodat ons dit kan regstel of verwyder — sien afdeling 6 hieronder.",
          ],
        },
        {
          h: "2. Watter Inligting Ons Versamel",
          p: [
            "Wanneer jy die webwerf gebruik, kan ons die volgende versamel:",
            "• Jou naam (wanneer jy 'n plasing, kommentaar, besigheidslysing, gebeurtenis, koop & verkoop item, of werksadvertensie indien)",
            "• Kontakbesonderhede soos foonnommer of e-pos (vir besigheidslysings)",
            "• Jou WhatsApp nommer (vir Koop & Verkoop en Werk plasings — sien afdeling 5 vir hoe dit gebruik word)",
            "• Foto's wat jy oplaai (bv. verlore/gevind items, gebeurtenisfoto's, besigheidsfoto's, koop & verkoop items)",
            "• Inhoud van jou plasings en kommentare",
            "Ons versamel NIE wagwoorde, betalingsbesonderhede, of enige sensitiewe persoonlike inligting via die webwerf nie. Betalings vir geborgde plasings of die carousel word direk met Jaco gereël (WhatsApp/kontant/EFT), nie deur die webwerf self nie.",
          ],
        },
        {
          h: "3. Hoekom Ons Dit Versamel",
          p: [
            "Ons gebruik jou inligting om:",
            "• Jou plasings, kommentare, en besigheidslysings op die webwerf te vertoon",
            "• Kontak tussen gemeenskapslede en besighede moontlik te maak",
            "• Kontak tussen kopers/verkopers (Koop & Verkoop) en werkgewers/werksoekers (Werk) moontlik te maak via WhatsApp",
            "• Die webwerf te modereer (bv. rapporteerde inhoud hersien)",
            "• Toekomstige funksies te ontwikkel, insluitend moontlike AI-gebaseerde funksies wat op geakkumuleerde, geanonimiseerde plasing-data gebaseer is (bv. 'n hulpbron wat algemene vrae kan beantwoord)",
          ],
        },
        {
          h: "4. Hoe Lank Ons Dit Hou",
          p: [
            "Plasings verdwyn na 30 dae uit die openbare feed (afhangende van kategorie), maar bly permanent in ons databasis vir rekord- en toekomstige ontwikkelingsdoeleindes, tensy jy versoek dat dit verwyder word.",
            "Koop & Verkoop items en Werk plasings verval nie outomaties nie — dit bly sigbaar totdat die plasing self as 'verkoop', 'gevul', of 'onbeskikbaar' gemerk word, of deur 'n administrateur verwyder word.",
          ],
        },
        {
          h: "5. Wie Toegang Het",
          p: [
            "Jou plasings, kommentare, en besigheidsinligting is openbaar sigbaar vir enigeen wat die webwerf besoek. Slegs Jaco du Plessis (as administrateur) het toegang tot die agtergrond-databasis en enige addisionele besonderhede.",
            "Vir Koop & Verkoop en Werk plasings word jou WhatsApp nommer nie as leesbare teks op die bladsy vertoon nie — dit word slegs binne-in die 'WhatsApp' knoppie se skakel ingebed sodat kopers/werkgewers jou direk kan kontak. Let egter daarop dat enigeen wat die bladsy se broncode ('page source') bekyk, moontlik hierdie nommer daar kan sien.",
          ],
        },
        {
          h: "6. Jou Regte",
          p: [
            "Onder POPIA het jy die reg om:",
            "• Te vra watter inligting ons oor jou het",
            "• Te vra dat foutiewe inligting reggestel word",
            "• Te vra dat jou inligting verwyder word",
            "Kontak Jaco du Plessis by die besonderhede hieronder om enige van hierdie regte uit te oefen.",
          ],
        },
        {
          h: "7. Kontak Ons",
          p: [
            "Vir enige vrae oor jou privaatheid of hierdie beleid, kontak Jaco du Plessis:",
            "WhatsApp: 060 366 1384",
            "E-pos: duplessisjaco978@gmail.com",
          ],
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      updated: "Last updated: August 2026",
      sections: [
{
          h: "1. Who We Are",
          p: [
            "Ons Brandfort Bulletin is operated by Jaco du Plessis, as a sole proprietor in Brandfort, Free State.",
            "This policy covers specifically how we handle and protect personal information, in accordance with South Africa's Protection of Personal Information Act (POPIA) — it does not cover the accuracy of content that users submit themselves (see our Terms & Conditions for that).",
            "If any information about you is incorrect (e.g. in a business listing), it's your responsibility to contact us so we can correct or remove it — see section 6 below.",
          ],
        },
        {
          h: "2. What Information We Collect",
          p: [
            "When you use the website, we may collect:",
            "• Your name (when you submit a post, comment, business listing, event, buy & sell item, or job listing)",
            "• Contact details such as phone number or email (for business listings)",
            "• Your WhatsApp number (for Buy & Sell and Jobs listings — see section 5 for how this is used)",
            "• Photos you upload (e.g. lost/found items, event photos, business photos, buy & sell items)",
            "• The content of your posts and comments",
            "We do NOT collect passwords, payment details, or any sensitive personal information through the website. Payments for sponsored posts or the carousel are arranged directly with Jaco (WhatsApp/cash/EFT), not through the website itself.",
          ],
        },
        {
          h: "3. Why We Collect It",
          p: [
            "We use your information to:",
            "• Display your posts, comments, and business listings on the website",
            "• Enable contact between community members and businesses",
            "• Enable contact between buyers/sellers (Buy & Sell) and employers/job seekers (Jobs) via WhatsApp",
            "• Moderate the website (e.g. reviewing reported content)",
            "• Develop future features, including possible AI-based features based on accumulated, anonymized post data (e.g. a resource that can answer common questions)",
          ],
        },
        {
          h: "4. How Long We Keep It",
          p: [
            "Posts disappear from the public feed after 30 days (depending on category), but remain permanently in our database for record-keeping and future development purposes, unless you request removal.",
            "Buy & Sell items and Jobs listings do not automatically expire — they remain visible until the listing itself is marked 'sold', 'filled', or 'unavailable', or removed by an administrator.",
          ],
        },
        {
          h: "5. Who Has Access",
          p: [
            "Your posts, comments, and business information are publicly visible to anyone who visits the website. Only Jaco du Plessis (as administrator) has access to the backend database and any additional details.",
            "For Buy & Sell and Jobs listings, your WhatsApp number is not displayed as readable text on the page — it's only embedded within the 'WhatsApp' button's link so buyers/employers can contact you directly. Note, however, that anyone viewing the page's source code could potentially see this number there.",
          ],
        },
        {
          h: "6. Your Rights",
          p: [
            "Under POPIA, you have the right to:",
            "• Ask what information we hold about you",
            "• Ask for incorrect information to be corrected",
            "• Ask for your information to be deleted",
            "Contact Jaco du Plessis using the details below to exercise any of these rights.",
          ],
        },
        {
          h: "7. Contact Us",
          p: [
            "For any questions about your privacy or this policy, contact Jaco du Plessis:",
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