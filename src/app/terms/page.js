// src/app/terms/page.js
"use client";
import { useLang } from "@/components/LangProvider";
import { useState } from "react";

export default function Terms() {
  const { lang } = useLang();

  const text = {
    af: {
      title: "Bepalings en Voorwaardes",
      updated: "Laas opgedateer: Oktober 2026",
      sections: [
        {
          h: "1. Oor Ons Brandfort Bulletin",
          p: [
            "Ons Brandfort Bulletin is 'n gratis, gemeenskapsgebaseerde platform vir die dorp Brandfort, geskep en bedryf deur Jaco du Plessis as 'n eenmansaak. Deur hierdie webwerf te gebruik, stem jy in tot hierdie bepalings en ons Privaatheidsbeleid.",
          ],
        },
        {
          h: "2. Rekeninge en Wie Die Webwerf Kan Gebruik",
          p: [
            "Enigeen kan die webwerf besoek, inhoud lees en speletjies speel sonder om in te teken.",
            "Rekeninge werk met Google-aanmelding. Jy moet 18 jaar of ouer wees, of jou ouer of voog se toestemming hê.",
            "Wanneer jy plasings maak (Gemeenskap Feed, kommentare, besigheidslysings, gebeurtenisse) moet jy 'n regte naam en, waar van toepassing, geldige kontakbesonderhede verskaf. Ons kan in die toekoms vereis dat jy ingeteken moet wees om te plaas of om tellings in Glitch Cafe te stoor.",
            "Jy is verantwoordelik vir alles wat met jou rekening gebeur. Een persoon, een rekening. Moenie 'n besigheidsnaam vir 'n persoonlike rekening gebruik nie — besigheidsrekeninge word apart ontwikkel.",
            "Ons kan 'n rekening opskort of verwyder wat hierdie bepalings oortree. Jy kan enige tyd vra dat jou rekening verwyder word (sien ons Privaatheidsbeleid).",
          ],
        },
        {
          h: "3. Gemeenskap Feed en Plasings",
          p: [
            "Die Gemeenskap Feed is bedoel vir persoonlike, nie-kommersiële gebruik — vrae, verlore/gevind items, aankondigings, shoutouts, en dies meer.",
            "Besighede mag NIE gratis plasings gebruik om hul besigheid, produkte, of dienste te adverteer nie. Besigheidsadvertensies is slegs beskikbaar deur die betaalde Geborgde Plasings of Besigheid Carousel geleenthede. Kontak ons vir pryse.",
            "Verbode inhoud: onwettige inhoud, teistering of dreigemente, haatspraak, bedrog of opligting, ander mense se private inligting sonder toestemming, die voorgee om iemand anders te wees, en spam.",
            "Ons behou die reg voor om enige plasing te verwyder wat nie aan hierdie reëls voldoen nie, sonder vooraf kennisgewing, na goeddunke van die administrateur.",
          ],
        },
        {
          h: "4. Inhoud en Verantwoordelikheid",
          p: [
            "Gebruikers is self verantwoordelik vir enige inhoud wat hulle plaas. Ons Brandfort Bulletin verifieer nie die akkuraatheid van gebruikersinhoud nie (bv. verlore/gevind items, besigheidsbeskrywings, kommentare) en aanvaar geen aanspreeklikheid vir foutiewe, misleidende, of ongepaste inhoud wat deur gebruikers geplaas word nie.",
            "Jy behou eienaarskap van jou inhoud, maar gee ons toestemming om dit te vertoon, te stoor, te modereer en die Bulletin daarmee te bevorder (bv. op ons sosiale media). Plaas net inhoud wat jy die reg het om te deel (bv. nie ander se foto's of video's nie). Video's van YouTube bly onder YouTube se voorwaardes.",
            "Gebruik die 🚩 Rapporteer-funksie om ongepaste inhoud aan ons uit te wys. Plasings word outomaties verberg na 3 rapporte, en word deur die administrateur hersien.",
          ],
        },
        {
          h: "5. Koop & Verkoop, Behuising en Werk",
          p: [
            "Hierdie afdelings is platforms waar gebruikers direk met mekaar kan skakel via WhatsApp. Ons Brandfort Bulletin is nie 'n party tot enige transaksie, huurooreenkoms, ooreenkoms, of aanstelling wat tussen gebruikers plaasvind nie, en fasiliteer geen betalings nie.",
            "Kopers en verkopers, huurders en verhuurders, en werkgewers en werksoekers, is self verantwoordelik om die geldigheid en veiligheid van enige transaksie of ooreenkoms te verseker. Ons aanvaar geen aanspreeklikheid vir verlies, skade, bedrog, of dispute wat uit sulke interaksies ontstaan nie.",
            "Behuising-lysings is slegs advertensies. Ons verifieer nie eiendomme, pryse of eienaars nie. Besigtig en verifieer self, en moenie deposito's betaal voordat jy die eiendom en die eienaar bevestig het nie.",
            "Dieselfde reëls in Afdeling 4 (Inhoud en Verantwoordelikheid) geld ook vir plasings in hierdie afdelings.",
          ],
        },
        {
          h: "6. Besigheidslysings en Adverteer",
          p: [
            "Basiese besigheidslysings is gratis. Uitgeligte plekke op die tuisblad-carousel en geborgde plasings in die feed is betaalde geleenthede. Pryse en beskikbaarheid kan verander sonder vooraf kennisgewing.",
            "Besigheidsinligting (soos openingstye en spyskaarte) word deur besighede of ons ingevoer. Kontak die besigheid self om belangrike besonderhede te bevestig.",
            "Betaalde besigheidsrekeninge word apart ontwikkel en sal hul eie bepalings hê wanneer hulle bekendgestel word.",
            "Ons behou die reg voor om enige besigheidslysing te weier, wysig, of verwyder wat nie aan ons standaarde voldoen nie.",
          ],
        },
        {
          h: "7. Glitch Cafe, XP en Kompetisies",
          p: [
            "Die speletjies is vir pret. XP, vlakke, take en tellings het geen geldwaarde nie en kan nie vir geld verruil word nie, tensy ons dit uitdruklik aankondig.",
            "Ons kan reëls, XP-waardes, vlakke en tellings enige tyd verander of terugstel. Vals of geoutomatiseerde inskrywings kan verwyder word en kan lei tot opskorting.",
            "Enige kompetisies of wenners (bv. Riddle Rush) word deur die administrateur bepaal, en sy besluit is finaal.",
          ],
        },
        {
          h: "8. Lientjie en Nood Kontakte",
          p: [
            "Lientjie is 'n outomatiese hulpmiddel wat jou na die regte bladsy of besigheid wys. Sy kan foute maak — bevestig belangrike besonderhede (soos openingstye) by die besigheid self. Sy gee nie professionele, mediese, regs- of finansiële advies nie.",
            "Nood-kontaknommers is vir gerief. In 'n noodgeval, kontak die amptelike nooddienste direk. Ons waarborg nie dat elke nommer altyd korrek is nie.",
          ],
        },
        {
          h: "9. Geen Waarborge en Aanspreeklikheid",
          p: [
            "Die webwerf word 'as is' verskaf. Ons waarborg nie ononderbroke toegang, foutlose werking, of dat inligting op die webwerf altyd op datum is nie.",
            "Sover die wet dit toelaat, is Ons Brandfort Bulletin nie aanspreeklik vir verlies of skade wat uit jou gebruik van die webwerf of gebruikersinhoud ontstaan nie. Niks hier beperk regte wat jy onder wetgewing het wat nie afgesien kan word nie.",
          ],
        },
        {
          h: "10. Wysigings",
          p: [
            "Ons kan hierdie bepalings te eniger tyd wysig. Voortgesette gebruik van die webwerf na wysigings beteken jy aanvaar die bygewerkte bepalings. Die datum bo-aan wys wanneer dit laas verander is.",
          ],
        },
        {
          h: "11. Toepaslike Reg",
          p: ["Hierdie bepalings word deur die wette van Suid-Afrika beheer."],
        },
        {
          h: "12. Kontak Ons",
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
      updated: "Last updated: October 2026",
      sections: [
        {
          h: "1. About Ons Brandfort Bulletin",
          p: [
            "Ons Brandfort Bulletin is a free, community-based platform for the town of Brandfort, created and operated by Jaco du Plessis as a sole proprietor. By using this website, you agree to these terms and our Privacy Policy.",
          ],
        },
        {
          h: "2. Accounts and Who Can Use The Website",
          p: [
            "Anyone can visit the website, read content and play games without signing in.",
            "Accounts work through Google sign-in. You must be 18 or older, or have your parent or guardian's consent.",
            "When you make posts (Community Feed, comments, business listings, events) you must provide a real name and, where applicable, valid contact details. In future we may require you to be signed in to post or to save scores in Glitch Cafe.",
            "You are responsible for everything that happens on your account. One person, one account. Please don't use a business name for a personal account — business accounts are being built separately.",
            "We may suspend or delete an account that breaks these terms. You can ask for your account to be deleted at any time (see our Privacy Policy).",
          ],
        },
        {
          h: "3. Community Feed and Posts",
          p: [
            "The Community Feed is intended for personal, non-commercial use — questions, lost/found items, announcements, shoutouts, and similar.",
            "Businesses may NOT use free posts to advertise their business, products, or services. Business advertising is only available through the paid Sponsored Posts or Business Carousel opportunities. Contact us for pricing.",
            "Prohibited content: anything illegal, harassment or threats, hate speech, fraud or scams, other people's private information without consent, pretending to be someone else, and spam.",
            "We reserve the right to remove any post that doesn't comply with these rules, without prior notice, at the administrator's discretion.",
          ],
        },
        {
          h: "4. Content and Responsibility",
          p: [
            "Users are solely responsible for any content they post. Ons Brandfort Bulletin does not verify the accuracy of user content (e.g. lost/found items, business descriptions, comments) and accepts no liability for incorrect, misleading, or inappropriate content posted by users.",
            "You keep ownership of your content, but you give us permission to display, store, moderate and use it to promote the Bulletin (e.g. on our social media). Only post content you have the right to share (e.g. not other people's photos or videos). YouTube videos remain under YouTube's terms.",
            "Use the 🚩 Report function to flag inappropriate content to us. Posts are automatically hidden after 3 reports, and reviewed by the administrator.",
          ],
        },
        {
          h: "5. Buy & Sell, Housing and Jobs",
          p: [
            "These sections are platforms where users can connect directly with each other via WhatsApp. Ons Brandfort Bulletin is not a party to any transaction, rental agreement, agreement, or hiring arrangement that takes place between users, and does not facilitate any payments.",
            "Buyers and sellers, tenants and landlords, and employers and job seekers, are solely responsible for ensuring the legitimacy and safety of any transaction or agreement. We accept no liability for loss, damage, fraud, or disputes arising from such interactions.",
            "Housing listings are advertisements only. We do not verify properties, prices or owners. Inspect and verify for yourself, and don't pay deposits before you have confirmed the property and the owner.",
            "The same rules in Section 4 (Content and Responsibility) also apply to posts in these sections.",
          ],
        },
        {
          h: "6. Business Listings and Advertising",
          p: [
            "Basic business listings are free. Featured spots on the homepage carousel and sponsored posts in the feed are paid opportunities. Prices and availability may change without prior notice.",
            "Business information (such as opening times and menus) is entered by businesses or by us. Contact the business directly to confirm important details.",
            "Paid business accounts are being built separately and will have their own terms when they launch.",
            "We reserve the right to refuse, edit, or remove any business listing that doesn't meet our standards.",
          ],
        },
        {
          h: "7. Glitch Cafe, XP and Competitions",
          p: [
            "The games are for fun. XP, levels, quests and scores have no cash value and cannot be exchanged for money unless we explicitly announce otherwise.",
            "We may change or reset rules, XP values, levels and scores at any time. Fake or automated entries may be removed and may lead to suspension.",
            "Any competitions or winners (e.g. Riddle Rush) are decided by the administrator, and his decision is final.",
          ],
        },
        {
          h: "8. Lientjie and Emergency Contacts",
          p: [
            "Lientjie is an automated helper that points you to the right page or business. She can make mistakes — confirm important details (like opening times) with the business itself. She does not give professional, medical, legal or financial advice.",
            "Emergency contact numbers are provided for convenience. In an emergency, contact the official emergency services directly. We do not guarantee that every number is always correct.",
          ],
        },
        {
          h: "9. No Warranties and Liability",
          p: [
            "The website is provided 'as is'. We do not guarantee uninterrupted access, error-free operation, or that information on the website is always up to date.",
            "To the extent the law allows, Ons Brandfort Bulletin is not liable for loss or damage arising from your use of the website or user content. Nothing here limits any rights you have under law that cannot be waived.",
          ],
        },
        {
          h: "10. Changes",
          p: [
            "We may modify these terms at any time. Continued use of the website after changes means you accept the updated terms. The date at the top shows when they were last changed.",
          ],
        },
        {
          h: "11. Governing Law",
          p: ["These terms are governed by the laws of South Africa."],
        },
        {
          h: "12. Contact Us",
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