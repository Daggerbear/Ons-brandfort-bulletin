// src/app/privacy/page.js
"use client";
import { useLang } from "@/components/LangProvider";
import { useState } from "react";

export default function Privacy() {
  const { lang } = useLang();

  const text = {
    af: {
      title: "Privaatheidsbeleid",
      updated: "Laas opgedateer: Oktober 2026",
      sections: [
        {
          h: "1. Wie Ons Is",
          p: [
            "Ons Brandfort Bulletin word bedryf deur Jaco du Plessis, as 'n eenmansaak in Brandfort, Vrystaat. Jaco is ook die aangewese inligtingsbeampte.",
            "Hierdie beleid gaan oor hoe ons persoonlike inligting hanteer en beskerm, in ooreenstemming met die Suid-Afrikaanse Wet op Beskerming van Persoonlike Inligting (POPIA). Dit gaan nie oor die akkuraatheid van inhoud wat gebruikers self plaas nie (sien ons Bepalings & Voorwaardes).",
            "As enige inligting oor jou verkeerd is (bv. in 'n besigheidslysing), kontak ons asseblief sodat ons dit kan regstel of verwyder — sien afdeling 9.",
          ],
        },
        {
          h: "2. Watter Inligting Ons Versamel",
          p: [
            "Wanneer jy die webwerf gebruik, kan ons die volgende versamel:",
            "• Jou naam (wanneer jy 'n plasing, kommentaar, besigheidslysing, gebeurtenis, koop & verkoop item, of werksadvertensie indien)",
            "• Kontakbesonderhede soos foonnommer of e-pos (vir besigheidslysings)",
            "• Jou WhatsApp nommer (vir Koop & Verkoop en Werk plasings — sien afdeling 5)",
            "• Foto's wat jy oplaai en die inhoud van jou plasings en kommentare",
            "As jy met Google inteken, versamel ons ook:",
            "• Jou Google-naam, e-posadres en profielfoto. Ons sien nooit jou Google-wagwoord nie — Google hanteer die aanmelding.",
            "• Jou profiel: vertoonnaam, kort bio (maks. 200 karakters) en gunstelingspeletjie",
            "• Jou XP, vlak en die aktiwiteite wat XP verdien het",
            "Jou profiel is tans slegs vir jou sigbaar. As ons dit ooit openbaar maak, sal dit jou keuse wees en sal ons eers hierdie beleid opdateer. Jou e-posadres word nooit openbaar vertoon nie.",
            "Ons versamel NIE betalingsbesonderhede of ander sensitiewe persoonlike inligting via die webwerf nie. Betalings vir geborgde plasings of die carousel word direk met Jaco gereël (WhatsApp/kontant/EFT).",
          ],
        },
        {
          h: "3. Hoekom Ons Dit Versamel",
          p: [
            "Ons gebruik jou inligting om:",
            "• Jou plasings, kommentare, en besigheidslysings te vertoon",
            "• Jou rekening, profiel en XP te bestuur",
            "• Kontak tussen gemeenskapslede, besighede, kopers/verkopers en werkgewers/werksoekers moontlik te maak (via WhatsApp)",
            "• Die webwerf te modereer en misbruik te voorkom",
            "• Die webwerf en toekomstige funksies te verbeter, insluitend hulpmiddels soos Lientjie wat op geakkumuleerde, geanonimiseerde data gebaseer kan wees",
          ],
        },
        {
          h: "4. Hoe Lank Ons Dit Hou",
          p: [
            "Plasings verdwyn na 30 dae uit die openbare feed (afhangende van kategorie), maar bly in ons databasis vir rekord- en ontwikkelingsdoeleindes, tensy jy versoek dat dit verwyder word.",
            "Koop & Verkoop items en Werk plasings verval nie outomaties nie — hulle bly sigbaar totdat die plasing as 'verkoop', 'gevul', of 'onbeskikbaar' gemerk word, of deur 'n administrateur verwyder word.",
            "Rekeninginligting bly totdat jy vra dat jou rekening verwyder word.",
          ],
        },
        {
          h: "5. Wie Toegang Het",
          p: [
            "Jou plasings, kommentare, en besigheidsinligting is openbaar sigbaar vir enigeen wat die webwerf besoek. Slegs Jaco du Plessis (as administrateur) het toegang tot die agtergrond-databasis en jou rekeningbesonderhede.",
            "Vir Koop & Verkoop en Werk plasings word jou WhatsApp nommer nie as leesbare teks vertoon nie — dit is slegs in die 'WhatsApp' knoppie se skakel ingebed. Enigeen wat die bladsy se broncode bekyk, kan die nommer egter moontlik sien.",
            "Ons gebruik diensverskaffers om die webwerf te bedryf: Supabase (databasis, aanmelding en lêerberging), Vercel (aanbieding en analise) en Google (aanmelding). Hulle verwerk data namens ons en hul bedieners kan buite Suid-Afrika wees. Sommige bladsye sluit ook eksterne inhoud in, soos YouTube-video's en radio-stroom. Ons verkoop nie jou inligting nie.",
          ],
        },
        {
          h: "6. Analise, Blaaierberging en Lientjie",
          p: [
            "• Ons hou eenvoudige gebruiksstatistiek by (bladsyskoue, besigheidsbesoeke en soekterme) om die webwerf te verbeter en aan besighede te wys hoeveel mense hulle sien. Ons gebruik ook Vercel Analytics.",
            "• Wanneer jy inteken, berg jou blaaier 'n sessiesleutel sodat jy ingeteken bly totdat jy uitteken.",
            "• Boodskappe wat jy aan Lientjie tik, kan gestoor en deur ons hersien word om haar beter te maak. Moet nie persoonlike besonderhede soos ID-nommers of bankbesonderhede in haar gesels tik nie.",
          ],
        },
        {
          h: "7. Kinders",
          p: [
            "Die webwerf is nie vir kinders onder 18 bedoel sonder 'n ouer of voog se toestemming nie. As jy onder 18 is, gebruik dit asseblief net met hul toestemming. As ons agterkom dat 'n kind se inligting sonder toestemming gestoor is, sal ons dit verwyder.",
          ],
        },
        {
          h: "8. Sekuriteit",
          p: [
            "Ons neem redelike stappe om jou inligting te beskerm, soos toegangsbeheer op ons databasis. Geen stelsel is egter 100% veilig nie. As 'n lek jou inligting raak, sal ons jou en die Inligtingsreguleerder in kennis stel soos POPIA vereis.",
          ],
        },
        {
          h: "9. Jou Regte",
          p: [
            "Onder POPIA het jy die reg om:",
            "• Te vra watter inligting ons oor jou het",
            "• Te vra dat foutiewe inligting reggestel word",
            "• Te vra dat jou inligting, of jou hele rekening en profiel, verwyder word",
            "Kontak Jaco du Plessis by die besonderhede hieronder om enige van hierdie regte uit te oefen",
          ],
        },
        {
          h: "10. Veranderinge aan Hierdie Beleid",
          p: [
            "Ons sal hierdie beleid opdateer wanneer nuwe funksies bykom (soos openbare profiele, besigheidsrekeninge of boodskappe). Die datum bo-aan wys wanneer dit laas verander is.",
          ],
        },
        {
          h: "11. Kontak Ons",
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
      updated: "Last updated: October 2026",
      sections: [
        {
          h: "1. Who We Are",
          p: [
            "Ons Brandfort Bulletin is operated by Jaco du Plessis, as a sole proprietor in Brandfort, Free State. Jaco is also the designated information officer.",
            "This policy covers how we handle and protect personal information, in accordance with South Africa's Protection of Personal Information Act (POPIA). It does not cover the accuracy of content that users submit themselves (see our Terms & Conditions).",
            "If any information about you is incorrect (e.g. in a business listing), please contact us so we can correct or remove it — see section 9.",
          ],
        },
        {
          h: "2. What Information We Collect",
          p: [
            "When you use the website, we may collect:",
            "• Your name (when you submit a post, comment, business listing, event, buy & sell item, or job listing)",
            "• Contact details such as phone number or email (for business listings)",
            "• Your WhatsApp number (for Buy & Sell and Jobs listings — see section 5)",
            "• Photos you upload, and the content of your posts and comments",
            "If you sign in with Google, we also collect:",
            "• Your Google name, email address and profile photo. We never see your Google password — Google handles the sign-in.",
            "• Your profile: display name, short bio (max. 200 characters) and favourite game",
            "• Your XP, level and the activities that earned XP",
            "Your profile is currently visible only to you. If we ever make profiles public, it will be your choice and we will update this policy first. Your email address is never shown publicly.",
            "We do NOT collect payment details or other sensitive personal information through the website. Payments for sponsored posts or the carousel are arranged directly with Jaco (WhatsApp/cash/EFT).",
          ],
        },
        {
          h: "3. Why We Collect It",
          p: [
            "We use your information to:",
            "• Display your posts, comments, and business listings",
            "• Manage your account, profile and XP",
            "• Enable contact between community members, businesses, buyers/sellers and employers/job seekers (via WhatsApp)",
            "• Moderate the website and prevent abuse",
            "• Improve the website and future features, including tools like Lientjie that may be based on accumulated, anonymized data",
          ],
        },
        {
          h: "4. How Long We Keep It",
          p: [
            "Posts disappear from the public feed after 30 days (depending on category), but remain in our database for record-keeping and development purposes, unless you request removal.",
            "Buy & Sell items and Jobs listings do not automatically expire — they remain visible until marked 'sold', 'filled', or 'unavailable', or removed by an administrator.",
            "Account information is kept until you ask for your account to be deleted.",
          ],
        },
        {
          h: "5. Who Has Access",
          p: [
            "Your posts, comments, and business information are publicly visible to anyone who visits the website. Only Jaco du Plessis (as administrator) has access to the backend database and your account details.",
            "For Buy & Sell and Jobs listings, your WhatsApp number is not displayed as readable text — it's only embedded in the 'WhatsApp' button's link. Anyone viewing the page's source code could potentially see it, however.",
            "We use service providers to run the website: Supabase (database, sign-in and file storage), Vercel (hosting and analytics) and Google (sign-in). They process data on our behalf, and their servers may be outside South Africa. Some pages also include external content, such as YouTube videos and the radio stream. We do not sell your information.",
          ],
        },
        {
          h: "6. Analytics, Browser Storage and Lientjie",
          p: [
            "• We keep simple usage statistics (page views, business views and search terms) to improve the website and show businesses how many people see them. We also use Vercel Analytics.",
            "• When you sign in, your browser stores a session key so you stay signed in until you sign out.",
            "• Messages you type to Lientjie may be stored and reviewed by us to make her better. Please don't type personal details such as ID numbers or bank details into her chat.",
          ],
        },
        {
          h: "7. Children",
          p: [
            "The website is not intended for children under 18 without a parent or guardian's consent. If you are under 18, please only use it with their permission. If we learn that a child's information was stored without consent, we will delete it.",
          ],
        },
        {
          h: "8. Security",
          p: [
            "We take reasonable steps to protect your information, such as access controls on our database. No system is 100% secure, however. If a breach affects your information, we will notify you and the Information Regulator as POPIA requires.",
          ],
        },
        {
          h: "9. Your Rights",
          p: [
            "Under POPIA, you have the right to:",
            "• Ask what information we hold about you",
            "• Ask for incorrect information to be corrected",
            "• Ask for your information, or your whole account and profile, to be deleted",
            "Contact Jaco du Plessis using the details below to exercise any of these rights",
          ],
        },
        {
          h: "10. Changes to This Policy",
          p: [
            "We will update this policy when new features are added (such as public profiles, business accounts or messaging). The date at the top shows when it was last changed.",
          ],
        },
        {
          h: "11. Contact Us",
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
      <div className="max-w-2xl mx-auto">

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