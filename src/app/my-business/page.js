// src/app/my-business/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/components/LangProvider";
import { useAuth } from "@/components/AuthProvider";
import { getMyBizText } from "@/components/mybiz/myBizText";
import { getDashText } from "@/components/dash/dashText";
import Dashboard from "@/components/dash/Dashboard";
import { safeScheme } from "@/lib/bizTheme";

function Message({ children }) {
  return (
    <main className="min-h-screen bg-neutral-950 px-4 pt-10 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-neutral-800 bg-neutral-900 p-5">{children}</div>
    </main>
  );
}

export default function MyBusiness() {
  const { lang } = useLang();
  const t = getMyBizText(lang);
  const d = getDashText(lang);
  const { user, loading: authLoading } = useAuth();
  const [state, setState] = useState({ loading: true, list: [], plans: {}, menus: {} });
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setState({ loading: false, list: [], plans: {}, menus: {} });
      return;
    }
    let alive = true;
    (async () => {
      const { data: rows } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: true });
      const list = rows || [];
      const ids = list.map((b) => b.id);
      const plans = {};
      const menus = {};
      if (ids.length) {
        const [subs, settings, ...actives] = await Promise.all([
          supabase.from("business_subscriptions").select("*").in("business_id", ids),
          supabase.from("business_menu_settings").select("business_id, menu_enabled").in("business_id", ids),
          ...ids.map((id) => supabase.rpc("has_active_plan", { p_business_id: id })),
        ]);
        ids.forEach((id, k) => {
          plans[id] = {
            active: !!actives[k].data,
            sub: (subs.data || []).find((s) => s.business_id === id) || null,
          };
          menus[id] = (settings.data || []).find((s) => s.business_id === id)?.menu_enabled === true;
        });
      }
      if (!alive) return;
      setState({ loading: false, list, plans, menus });
      setActiveId((cur) => cur ?? list[0]?.id ?? null);
    })();
    return () => {
      alive = false;
    };
  }, [user?.id, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const { loading, list, plans, menus } = state;
  if (loading) return null;

  if (!user) {
    return (
      <Message>
        <p className="text-sm text-neutral-300">{t.signin}</p>
        <Link
          href="/profile"
          className="mt-4 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-600"
        >
          {t.signinBtn}
        </Link>
      </Message>
    );
  }

  if (list.length === 0) {
    return (
      <Message>
        <p className="font-semibold">{t.none}</p>
        <p className="mt-2 text-sm text-neutral-400">{t.noneHelp}</p>
        <Link
          href="/besighede"
          className="mt-4 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-600"
        >
          {t.browse}
        </Link>
      </Message>
    );
  }

  const biz = list.find((b) => b.id === activeId) || list[0];
  const plan = plans[biz.id];
  // The dashboard wears the business's own colours, once the paid plan is active
  const scheme = plan?.active ? safeScheme(biz.page_theme) : "orange";

  return (
    <Dashboard
      key={biz.id}
      biz={biz}
      plan={plan}
      menuEnabled={!!menus[biz.id]}
      scheme={scheme}
      businesses={list}
      onSwitch={setActiveId}
      t={t}
      d={d}
      lang={lang}
    />
  );
}
