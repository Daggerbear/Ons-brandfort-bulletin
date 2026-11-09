// src/app/create/[type]/page.js
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LangProvider";
import { FORMS } from "@/lib/createForms";
import { BUSINESS_FORMS } from "@/lib/createFormsBusiness";
import { uploadPhoto, recall, remember, rememberMine } from "@/lib/createHelpers";
import FieldRenderer from "@/components/create/FieldRenderer";
import SelectField from "@/components/create/SelectField";

const UI = {
  af: {
    back: "← Terug",
    send: "Plaas",
    submit: "Dien in",
    sending: "Stuur...",
    agree: "Deur te plaas, aanvaar jy ons",
    terms: "Bepalings",
    fill: (l) => `Vul asseblief "${l}" in.`,
    photoFail: "Kon nie die foto oplaai nie. Probeer 'n ander foto, of verwyder dit.",
    generic: "Iets het skeefgeloop. Probeer asseblief weer.",
    doneLive: "Dit is geplaas!",
    doneLiveSub: "Jou plasing is nou sigbaar vir Brandfort.",
    donePending: "Ingedien!",
    donePendingSub: "Ons keur dit gou goed, dan verskyn dit op die Bulletin.",
    shareWa: "Deel op WhatsApp",
    see: "Sien dit",
    another: "Plaas nog een",
    notFound: "Hierdie bladsy bestaan nie.",
    home: "Terug na die Bulletin",
    gateTitle: "Teken in om te plaas",
    gateNote: "Jy het 'n gratis rekening nodig om te plaas. Dit hou die Bulletin veilig vir almal.",
    gateSignIn: "Teken in met Google",
    profTitle: "Stoor eers jou profiel",
    profNote: "Jy het 'n profiel nodig om te plaas. Dit vat net 'n minuut, en ons vul jou besonderhede dan vir jou in.",
    profGo: "Maak my profiel klaar",
  },
  en: {
    back: "← Back",
    send: "Post",
    submit: "Submit",
    sending: "Sending...",
    agree: "By posting, you agree to our",
    terms: "Terms",
    fill: (l) => `Please fill in "${l}".`,
    photoFail: "Couldn't upload the photo. Try a different photo, or remove it.",
    generic: "Something went wrong. Please try again.",
    doneLive: "It's posted!",
    doneLiveSub: "Your post is now visible to Brandfort.",
    donePending: "Submitted!",
    donePendingSub: "We'll approve it soon, then it appears on the Bulletin.",
    shareWa: "Share on WhatsApp",
    see: "See it",
    another: "Post another",
    notFound: "This page doesn't exist.",
    home: "Back to the Bulletin",
    gateTitle: "Sign in to post",
    gateNote: "You need a free account to post. It keeps the Bulletin safe for everyone.",
    gateSignIn: "Sign in with Google",
    profTitle: "Save your profile first",
    profNote: "You need a profile to post. It only takes a minute, and then we fill in your details for you.",
    profGo: "Set up my profile",
  },
};

// Which fields this phone remembers between posts (name and WhatsApp number)
function memKey(field) {
  if (field.remember !== undefined) return field.remember;
  if (field.name === "name") return "bulletin_name";
  if (field.name === "whatsapp") return "bulletin_whatsapp";
  return null;
}

function labelText(field, values, lang) {
  const spec = typeof field.label === "function" ? field.label(values) : field.label;
  return spec?.[lang] || field.name;
}

export default function CreatePage() {
  const { type } = useParams();
  const form = FORMS[type] || BUSINESS_FORMS[type];
  const { lang } = useLang();
  const t = UI[lang];
  const { user, loading: authLoading, busy, signInWithGoogle } = useAuth();

  // Saved profile (name and WhatsApp number). undefined = still loading, null = none saved yet
  const [profile, setProfile] = useState(undefined);

  const [values, setValues] = useState({});
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);

  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));

  // Starting values: defaults, remembered details, and presets from the link
  useEffect(() => {
    if (!form) return;
    const init = { price: "", priceOnRequest: false };
    const params = new URLSearchParams(window.location.search);

    form.fields.forEach((f) => {
      if (f.default !== undefined) init[f.name] = f.default;
      const key = memKey(f);
      if (key) init[f.name] = recall(key);

      // Links like /create/share?cat=lost pre-pick an option
      if (f.kind === "chips") {
        const want =
          params.get(f.name) || (f.name === "category" ? params.get("cat") : null);
        if (want && f.options.some((o) => o.value === want)) init[f.name] = want;
      }
    });

    setValues(init);
    setPhoto(null);
    setPreview(null);
    setStatus("idle");
    setError("");
  }, [type, resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load the saved profile so forms can prefill name and WhatsApp number
  const userId = user?.id;
  useEffect(() => {
    if (!userId) {
      setProfile(undefined);
      return;
    }
    let active = true;
    supabase
      .from("profiles")
      .select("display_name, whatsapp")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile(data || null);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // The profile wins over what this phone remembers
  useEffect(() => {
    if (!form || !profile) return;
    setValues((prev) => {
      const next = { ...prev };
      form.fields.forEach((f) => {
        if (f.name === "name" && profile.display_name) next.name = profile.display_name;
        if (f.name === "whatsapp" && profile.whatsapp) next.whatsapp = profile.whatsapp;
      });
      return next;
    });
  }, [profile, type, resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // Suggest the signed-in person's first name when this phone doesn't know one yet
  const given = user?.user_metadata?.given_name || "";
  const hasNameField = !!form?.fields.some((f) => f.name === "name" && memKey(f));
  useEffect(() => {
    if (given && hasNameField) {
      setValues((prev) => (prev.name ? prev : { ...prev, name: given }));
    }
  }, [given, hasNameField, type, resetKey]);

  const onPickPhoto = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    setPhoto(picked);
    setPreview(URL.createObjectURL(picked));
  };

  const onRemovePhoto = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(null);
    setPreview(null);
  };

  async function submit(e) {
    e?.preventDefault?.();
    setError("");

    for (const f of form.fields) {
      if (f.required && !String(values[f.name] ?? "").trim()) {
        setError(t.fill(labelText(f, values, lang)));
        return;
      }
    }
    const custom = form.validate?.(values, lang);
    if (custom) {
      setError(custom);
      return;
    }

    setStatus("sending");

    let imageUrl = null;
    if (photo && form.bucket) {
      try {
        imageUrl = await uploadPhoto(form.bucket, photo, form.photoMode);
      } catch (err) {
        console.log("Upload error:", err);
        setError(t.photoFail);
        setStatus("idle");
        return;
      }
    }

    const query = supabase.from(form.table).insert(form.build(values, { imageUrl }));
    const { data, error: insertError } = form.mine
      ? await query.select("id").single()
      : await query;

    if (insertError) {
      console.log("Insert error:", insertError);
      setError(t.generic);
      setStatus("idle");
      return;
    }

    if (form.mine && data?.id) rememberMine(form.mine, data.id);
    form.fields.forEach((f) => {
      const key = memKey(f);
      const val = String(values[f.name] ?? "").trim();
      if (key && val) remember(key, val);
    });
    setStatus("done");
  }

  if (!form) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-white">
        <p className="text-neutral-300">{t.notFound}</p>
        <Link href="/" className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-black">
          {t.home}
        </Link>
      </main>
    );
  }

  if (status === "done") {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    // seeHref can be a plain link or a function that looks at what was posted
    const seeHref =
      typeof form.seeHref === "function" ? form.seeHref(values) : form.seeHref;
    const shareUrl =
      form.live && form.shareText
        ? `https://wa.me/?text=${encodeURIComponent(
            `${form.shareText(values)}\n\n${origin}${seeHref}`
          )}`
        : null;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 px-6 text-center text-white">
        <div className="text-7xl">🎉</div>
        <h1 className="mt-4 text-3xl font-black">
          {form.live ? t.doneLive : t.donePending}
        </h1>
        <p className="mt-2 max-w-xs text-neutral-300">
          {form.live ? t.doneLiveSub : t.donePendingSub}
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          {shareUrl && (
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-green-500 py-4 text-base font-bold text-black transition hover:bg-green-600"
            >
              📲 {t.shareWa}
            </a>
          )}
          <Link
            href={seeHref}
            className="rounded-xl bg-orange-500 py-4 text-base font-bold text-black transition hover:bg-orange-600"
          >
            {t.see}
          </Link>
          <button
            type="button"
            onClick={() => setResetKey((k) => k + 1)}
            className="rounded-xl border border-neutral-700 py-3.5 text-sm font-semibold text-neutral-200 transition hover:border-orange-500"
          >
            {t.another}
          </button>
        </div>
      </main>
    );
  }

  // Posting needs an account with a saved profile
  if (authLoading || (user && profile === undefined)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-500">
        ...
      </main>
    );
  }
  if (!user || !profile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 px-6 text-center text-white">
        <div className="text-5xl">{user ? "📝" : "🔐"}</div>
        <h1 className="text-2xl font-black">{user ? t.profTitle : t.gateTitle}</h1>
        <p className="max-w-xs text-sm text-neutral-400">
          {user ? t.profNote : t.gateNote}
        </p>
        {user ? (
          <Link
            href="/profile"
            className="rounded-xl bg-orange-500 px-6 py-3.5 text-base font-bold text-black transition hover:bg-orange-600"
          >
            {t.profGo}
          </Link>
        ) : (
          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={busy}
            className="rounded-xl bg-orange-500 px-6 py-3.5 text-base font-bold text-black transition hover:bg-orange-600 disabled:opacity-50"
          >
            {t.gateSignIn}
          </button>
        )}
        <Link href="/" className="text-sm text-neutral-500 hover:text-orange-400">
          {t.home}
        </Link>
      </main>
    );
  }

  const sending = status === "sending";
  const rules = form.rules?.[lang];
  const halfFields = [];
  const items = [];

  // Put side-by-side fields (bedrooms and bathrooms) into one row
  form.fields.forEach((f) => {
    if (f.half) {
      halfFields.push(f);
      return;
    }
    if (halfFields.length) {
      items.push({ row: [...halfFields] });
      halfFields.length = 0;
    }
    items.push({ field: f });
  });
  if (halfFields.length) items.push({ row: [...halfFields] });

  const renderField = (f) =>
    f.kind === "select" || f.kind === "business" ? (
      <SelectField key={f.name} field={f} values={values} set={set} lang={lang} />
    ) : (
      <FieldRenderer
        key={f.name}
        field={f}
        values={values}
        set={set}
        lang={lang}
        preview={preview}
        onPickPhoto={onPickPhoto}
        onRemovePhoto={onRemovePhoto}
      />
    );

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <form onSubmit={submit} className="mx-auto max-w-md px-5 pb-44 pt-4">
        <Link href="/" className="text-sm text-neutral-400 hover:text-orange-400">
          {t.back}
        </Link>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-4xl">{form.icon}</span>
          <div>
            <h1 className="text-2xl font-black leading-tight">{form.title[lang]}</h1>
            <p className="text-sm text-neutral-400">{form.intro[lang]}</p>
          </div>
        </div>

        {rules && (
          <p className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs leading-relaxed text-neutral-400">
            ℹ️ {rules}
          </p>
        )}

        <div className="mt-6 space-y-6">
          {items.map((item, i) =>
            item.row ? (
              <div key={`row-${i}`} className="grid grid-cols-2 gap-4">
                {item.row.map(renderField)}
              </div>
            ) : (
              renderField(item.field)
            )
          )}
        </div>
      </form>

      {/* Post button stays at the bottom of the screen */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-800 bg-neutral-950/95 px-5 pt-3 backdrop-blur-md"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="mx-auto max-w-md">
          {error && (
            <p role="alert" className="mb-2 text-center text-sm text-red-400">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={sending}
            className="w-full rounded-xl bg-orange-500 py-4 text-base font-bold text-black transition hover:bg-orange-600 disabled:opacity-50"
          >
            {sending ? t.sending : form.live ? t.send : t.submit}
          </button>
          <p className="mt-2 text-center text-[11px] text-neutral-500">
            {t.agree}{" "}
            <Link href="/terms" className="underline hover:text-orange-400">
              {t.terms}
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}