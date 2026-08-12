"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";

export default function BusinessDetail() {
  const { id } = useParams();
  const [lang, setLang] = useState("af");
  const [business, setBusiness] = useState(null);
  const [menuEnabled, setMenuEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      const [businessResult, menuResult] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", id).single(),
        supabase
          .from("business_menu_settings")
          .select("menu_enabled")
          .eq("business_id", id)
          .maybeSingle(),
      ]);

      if (!businessResult.error) setBusiness(businessResult.data);
      setMenuEnabled(menuResult.data?.menu_enabled === true);
      setLoading(false);
    };

    if (id) fetchBusiness();
  }, [id]);

  const text = {
    af: {
      back: "Terug na Tuisblad",
      address: "Adres",
      hours: "Ure",
      contact: "Kontak",
      whatsapp: "Stuur WhatsApp",
      menu: "Sien ons spyskaart",
      notFound: "Besigheid nie gevind nie.",
    },
    en: {
      back: "Back to Homepage",
      address: "Address",
      hours: "Hours",
      contact: "Contact",
      whatsapp: "Message on WhatsApp",
      menu: "View our menu",
      notFound: "Business not found.",
    },
  };

  const t = text[lang];

  const getWhatsappLink = (contact) => {
    if (!contact) return null;
    const match = contact.match(/0\d[\d\s]{7,}/);
    if (!match) return null;
    let digits = match[0].replace(/\D/g, "");
    if (digits.length < 9) return null;
    digits = "27" + digits.slice(1);

    const message =
      lang === "af"
        ? "Hi, ek het jou op Ons Brandfort Bulletin gekry! Ek wil navrae doen oor "
        : "Hi, I found you on Ons Brandfort Bulletin! I'd like to enquire about ";

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <p className="text-neutral-400 text-center mt-20">Loading...</p>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <div className="max-w-md mx-auto mt-20 text-center">
          <p className="text-neutral-400 mb-6">{t.notFound}</p>
          <a
            href="/"
            className="text-orange-400 hover:text-orange-300 underline"
          >
            {t.back}
          </a>
        </div>
      </main>
    );
  }

  const whatsappLink = getWhatsappLink(business.contact);

  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
      <Nav lang={lang} />
      <div className="max-w-md mx-auto mt-8">
        <button
          onClick={() => setLang(lang === "af" ? "en" : "af")}
          className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition mb-8"
        >
          {lang === "af" ? "English" : "Afrikaans"}
        </button>

        {business.logo_url && (
          <img
            src={business.logo_url}
            alt={`${business.name} logo`}
            className="w-24 h-24 object-cover rounded-xl border border-neutral-800 mb-4"
          />
        )}

        <span className="inline-block text-xs uppercase tracking-wide text-orange-400 border border-orange-500/40 rounded-full px-3 py-1 mb-4">
          {business.category}
        </span>
        <h1 className="text-3xl font-bold mb-4">{business.name}</h1>
        <p className="text-neutral-300 mb-6 leading-relaxed">
          {business.description}
        </p>

        <div className="space-y-3 mb-8 border-t border-neutral-800 pt-6">
          {business.address && (
            <div>
              <p className="text-xs text-neutral-500 uppercase">{t.address}</p>
              <p className="text-white">{business.address}</p>
            </div>
          )}
          {business.hours && (
            <div>
              <p className="text-xs text-neutral-500 uppercase">{t.hours}</p>
              <p className="text-white">{business.hours}</p>
            </div>
          )}
          {business.contact && (
            <div>
              <p className="text-xs text-neutral-500 uppercase">{t.contact}</p>
              <p className="text-white">{business.contact}</p>
            </div>
          )}
        </div>

{menuEnabled && (
 <a
 href={`/business/${business.id}/menu`}
 className="block w-full text-center bg-orange-500 hover:bg-orange-600 transition text-white font-semibold rounded-lg px-4 py-3 mb-3"
 >
 {t.menu}
 </a>
)}

        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-green-600 hover:bg-green-700 transition text-white font-semibold rounded-lg px-4 py-3 mb-4"
          >
            {t.whatsapp}
          </a>
        )}

        <a
          href="/"
          className="block text-center text-neutral-400 hover:text-white underline"
        >
          {t.back}
        </a>
      </div>
    </main>
  );
}
