// src/app/my-business/[id]/menu/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";
import { useAuth } from "@/components/AuthProvider";
import MenuEditor from "@/components/MenuEditor";

const T = {
  af: {
    loading: "Laai...",
    signin: "Teken in om jou spyskaart te bestuur.",
    signinBtn: "Teken in",
    notYours: "Hierdie besigheid is nie aan jou gekoppel nie.",
    back: "← Terug na My Besigheid",
    lockedTitle: "Spyskaartgereedskap is gesluit",
    lockedText:
      "Jou plan is nie aktief nie. Die spyskaart en bestellings is deel van die beginnerpakket. Kontak ons om dit weer aan te skakel.",
    contact: "Kontak ons",
  },
  en: {
    loading: "Loading...",
    signin: "Sign in to manage your menu.",
    signinBtn: "Sign in",
    notYours: "This business is not linked to you.",
    back: "← Back to My Business",
    lockedTitle: "Menu tools are locked",
    lockedText:
      "Your plan is not active. The menu and ordering tools are part of the starter package. Contact us to switch them back on.",
    contact: "Contact us",
  },
};

function Box({ children }) {
  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center px-6">
      <div className="max-w-sm w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center">
        {children}
      </div>
    </main>
  );
}

export default function OwnerMenu() {
  const { id } = useParams();
  const { lang } = useLang();
  const t = T[lang] || T.af;
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState("loading"); // loading | ok | notyours | locked

  useEffect(() => {
    if (authLoading || !user || !id) return;
    let alive = true;
    (async () => {
      const { data: biz } = await supabase
        .from("businesses")
        .select("id, owner_id")
        .eq("id", id)
        .maybeSingle();
      if (!alive) return;
      if (!biz || biz.owner_id !== user.id) return setState("notyours");
      const { data: active } = await supabase.rpc("has_active_plan", {
        p_business_id: Number(id),
      });
      if (!alive) return;
      setState(active ? "ok" : "locked");
    })();
    return () => {
      alive = false;
    };
  }, [authLoading, user?.id, id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (authLoading) return <Box>{t.loading}</Box>;
  if (!user)
    return (
      <Box>
        <p className="text-sm text-neutral-300">{t.signin}</p>
        <Link
          href="/profile"
          className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 transition text-black text-sm font-semibold rounded-lg px-4 py-2"
        >
          {t.signinBtn}
        </Link>
      </Box>
    );
  if (state === "loading") return <Box>{t.loading}</Box>;
  if (state === "notyours")
    return (
      <Box>
        <p className="text-sm text-neutral-300">{t.notYours}</p>
        <Link href="/my-business" className="inline-block mt-4 text-sm text-orange-400">
          {t.back}
        </Link>
      </Box>
    );
  if (state === "locked")
    return (
      <Box>
        <p className="text-lg font-bold">🔒 {t.lockedTitle}</p>
        <p className="text-sm text-neutral-400 mt-2">{t.lockedText}</p>
        <Link
          href="/contact"
          className="inline-block mt-4 bg-orange-500 hover:bg-orange-600 transition text-black text-sm font-semibold rounded-lg px-4 py-2"
        >
          {t.contact}
        </Link>
      </Box>
    );

  return <MenuEditor businessId={id} backHref="/my-business" backLabel={t.back} />;
}
