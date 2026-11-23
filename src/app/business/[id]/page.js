// src/app/business/[id]/page.js
"use client";
import { useLang } from "@/components/LangProvider";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { trackEvent } from "@/lib/analytics";
import { SkeletonBusinessDetail } from "@/components/Skeleton";
import { getCategoryByName } from "@/lib/categories";
import BusinessLayout from "@/components/biz/templates";
import { DEFAULT_SCHEME, DEFAULT_TEMPLATE, safeScheme, safeTemplate, themeStyle } from "@/lib/bizTheme";

// Finds the first SA phone number in free text; returns digits like 27710978901
function extractNumber(contact) {
  if (!contact) return null;
  const match = contact.match(/(?:\+?27|0)[\d\s()-]{8,}/);
  if (!match) return null;
  let digits = match[0].replace(/\D/g, "");
  if (digits.startsWith("0")) digits = "27" + digits.slice(1);
  return digits.length >= 11 && digits.length <= 12 ? digits : null;
}

function getWebsiteLink(website) {
  if (!website) return null;
  if (website.startsWith("http://") || website.startsWith("https://")) return website;
  return `https://${website}`;
}

const text = {
  af: {
    back: "Terug na Kategorie",
    address: "Adres",
    hours: "Ure",
    contact: "Kontak",
    whatsapp: "WhatsApp",
    call: "Bel",
    website: "Webwerf",
    menu: "Katalogus",
    services: "Dienste",
    openMaps: "Maak oop in Maps →",
    notFound: "Besigheid nie gevind nie.",
    share: "Deel hierdie besigheid",
    sisterBusinesses: "Ook Deur Dieselfde Eienaar",
    waMessage: "Hi, ek het jou op Ons Brandfort Bulletin gekry! Ek wil navrae doen oor ",
    shareMessage: (name, desc, url) =>
      `Kyk na ${name} op Ons Brandfort Bulletin — ${desc}. Sien hul besonderhede hier: ${url}`,
  },
  en: {
    back: "Back to Category",
    address: "Address",
    hours: "Hours",
    contact: "Contact",
    whatsapp: "WhatsApp",
    call: "Call",
    website: "Website",
    menu: "Catalogue",
    services: "Services",
    openMaps: "Open in Maps →",
    notFound: "Business not found.",
    share: "Share this business",
    sisterBusinesses: "Also By The Same Owner",
    waMessage: "Hi, I found you on Ons Brandfort Bulletin! I'd like to enquire about ",
    shareMessage: (name, desc, url) =>
      `Check out ${name} on Ons Brandfort Bulletin — ${desc}. View their details here: ${url}`,
  },
};

export default function BusinessDetail() {
  const { id } = useParams();
  const { lang } = useLang();
  const [business, setBusiness] = useState(null);
  const [menuEnabled, setMenuEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [sisterBusinesses, setSisterBusinesses] = useState([]);
  const [look, setLook] = useState({ template: DEFAULT_TEMPLATE, theme: DEFAULT_SCHEME });

  const t = text[lang];

  useEffect(() => {
    const fetchBusiness = async () => {
      const [businessResult, menuResult, updatesResult, lookResult] = await Promise.all([
        supabase.from("businesses").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("business_menu_settings")
          .select("menu_enabled")
          .eq("business_id", id)
          .maybeSingle(),
        supabase
          .from("business_updates")
          .select("*")
          .eq("business_id", id)
          .eq("Status", "approved")
          .order("created_at", { ascending: false })
          .limit(3),
        // The paid page look. If the plan has lapsed (or the SQL piece is not run yet) this is the free default.
        supabase.rpc("business_look", { p_business_id: Number(id) }),
      ]);

      const biz = businessResult.data;
      setBusiness(biz || null);

      const row = Array.isArray(lookResult.data) ? lookResult.data[0] : lookResult.data;
      if (row && !lookResult.error) {
        setLook({ template: safeTemplate(row.page_template), theme: safeScheme(row.page_theme) });
      }

      if (biz) {
        trackEvent("business_view", { businessId: biz.id });
        if (new URLSearchParams(window.location.search).get("src") === "qr") {
          trackEvent("qr_scan", { businessId: biz.id });
        }

        if (biz.sister_group) {
          const { data: sisters } = await supabase
            .from("businesses")
            .select("id, name, category, logo_url")
            .eq("sister_group", biz.sister_group)
            .eq("Status", "approved")
            .neq("id", id);
          setSisterBusinesses(sisters || []);
        }
      }
      setMenuEnabled(menuResult.data?.menu_enabled === true);
      setUpdates(updatesResult.data || []);
      setLoading(false);
    };

    if (id) {
      fetchBusiness();
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    const { data } = await supabase
      .from("business_reviews")
      .select("*")
      .eq("business_id", id)
      .order("created_at", { ascending: false });
    setReviews(data || []);
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <SkeletonBusinessDetail />
      </main>
    );
  }

  if (!business) {
    return (
      <main className="min-h-screen bg-neutral-950 text-white px-6 py-10">
        <Nav lang={lang} />
        <div className="max-w-md mx-auto mt-20 text-center">
          <div className="text-5xl mb-3">🏪</div>
          <p className="text-neutral-400 mb-6">{t.notFound}</p>
          <Link href="/besighede" className="text-orange-400 hover:text-orange-300 underline">
            {t.back}
          </Link>
        </div>
      </main>
    );
  }

  const found = getCategoryByName(business.category);
  const cat = {
    icon: found?.icon || "🏪",
    label: found ? found[lang] : business.category,
    slug: found?.slug || "all",
  };

  const digits = extractNumber(business.contact);
  const links = {
    whatsapp: digits ? `https://wa.me/${digits}?text=${encodeURIComponent(t.waMessage)}` : null,
    call: digits ? `tel:+${digits}` : null,
    website: getWebsiteLink(business.website),
    maps: business.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${business.address}, Brandfort, South Africa`
        )}`
      : null,
  };

  // Clean URL + UTM so shares show up under UTM Parameters in Vercel Analytics
  const shareUrl = `https://ons-brandfort-bulletin.vercel.app/business/${id}?utm_source=whatsapp&utm_medium=share`;
  const shareDesc = business.category || business.description?.slice(0, 60) || "";
  links.share = `https://wa.me/?text=${encodeURIComponent(t.shareMessage(business.name, shareDesc, shareUrl))}`;

  const ctx = {
    business,
    id,
    lang,
    t,
    cat,
    rating: { avg: averageRating, count: reviews.length },
    links,
    menuEnabled,
    updates,
    reviews,
    sisters: sisterBusinesses,
    fetchReviews,
    track: (type) => trackEvent(type, { businessId: business.id }),
  };

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{ ...themeStyle(look.theme), background: "var(--bz-bg)", color: "var(--bz-text)" }}
    >
      <Nav lang={lang} />
      <BusinessLayout template={look.template} ctx={ctx} />
      <Footer lang={lang} />
    </main>
  );
}
