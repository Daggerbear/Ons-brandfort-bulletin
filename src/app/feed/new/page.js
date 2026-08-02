"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

const categories = [
  { value: "question", af: "Vra", en: "Question" },
  { value: "lost", af: "Verlore", en: "Lost" },
  { value: "found", af: "Gevind", en: "Found" },
  { value: "announcement", af: "Aankondiging", en: "Announcement" },
  { value: "birthday", af: "Verjaarsdag", en: "Birthday" },
  { value: "thank_you", af: "Dankie", en: "Thank You" },
  { value: "recommendation", af: "Aanbeveling", en: "Recommendation" },
  { value: "warning", af: "Waarskuwing", en: "Warning" },
  { value: "community", af: "Gemeenskap", en: "Community" },
];

export default function NewPost() {
  const [lang, setLang] = useState("af");
  const [rulesOpen, setRulesOpen] = useState(false);
  const router = useRouter();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("question");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const text = {
    af: {
      heading: "Nuwe Plasing",
      namePlaceholder: "Jou naam",
      contentPlaceholder: "Wat wil jy sê?",
      choosePhoto: "Kies foto",
      submit: "Plaas",
      submitting: "Stuur...",
      fillIn: "Vul asseblief alles in.",
      photoFail: "Foto oplaai het misluk.",
      wrong: "Iets het verkeerd gegaan.",
      rulesTitle: "📋 Feed Reëls",
      rules: [
        "Nie vir besigheidsadvertensies nie — kontak ons vir geborgde plasings.",
        "Wees respekvol — geen haatspraak, teistering, of onvanpaste inhoud nie.",
        "Geen vals inligting of skadelike leuens nie.",
        "Gebruik jou regte naam.",
        "Plasings wat 3 rapporte kry word outomaties verberg en hersien.",
        "Ons behou die reg voor om enige plasing te verwyder.",
      ],
      agree: "Deur te plaas, stem jy in tot ons",
      terms: "Bepalings & Voorwaardes",
    },
    en: {
      heading: "New Post",
      namePlaceholder: "Your name",
      contentPlaceholder: "What do you want to say?",
      choosePhoto: "Choose photo",
      submit: "Post",
      submitting: "Posting...",
      fillIn: "Please fill in all fields.",
      photoFail: "Photo upload failed.",
      wrong: "Something went wrong.",
      rulesTitle: "📋 Feed Rules",
      rules: [
        "Not for business advertising — contact us for sponsored posts.",
        "Be respectful — no hate speech, harassment, or inappropriate content.",
        "No false information or harmful lies.",
        "Use your real name.",
        "Posts that get 3 reports are automatically hidden and reviewed.",
        "We reserve the right to remove any post.",
      ],
      agree: "By posting, you agree to our",
      terms: "Terms & Conditions",
    },
  };

  const t = text[lang];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      setError(t.fillIn);
      return;
    }

    setSubmitting(true);
    setError("");

    let image_url = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, imageFile);

      if (uploadError) {
        setError(t.photoFail);
        setSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("posts")
        .getPublicUrl(fileName);
      image_url = publicUrlData.publicUrl;
    }

    const { error: insertError } = await supabase.from("posts").insert({
      name: name.trim(),
      category,
      content: content.trim(),
      image_url,
    });

    setSubmitting(false);

    if (insertError) {
      setError(t.wrong);
      return;
    }

    router.push("/feed");
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Nav lang={lang} setLang={setLang} />

      <div className="max-w-2xl mx-auto px-4 py-6 flex-1 w-full">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{t.heading}</h1>
          <button
            onClick={() => setLang(lang === "af" ? "en" : "af")}
            className="text-sm border border-neutral-700 rounded-full px-3 py-1 text-neutral-300 hover:border-orange-500 hover:text-orange-400 transition"
          >
            {lang === "af" ? "English" : "Afrikaans"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setRulesOpen((prev) => !prev)}
          className="w-full flex justify-between items-center bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4"
        >
          <span className="font-semibold">{t.rulesTitle}</span>
          <span className="text-gray-400">{rulesOpen ? "▲" : "▼"}</span>
        </button>

        {rulesOpen && (
          <ul className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-4 mb-4 text-sm text-gray-300 space-y-2 list-disc list-inside">
            {t.rules.map((rule, i) => (
              <li key={i}>{rule}</li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {lang === "af" ? cat.af : cat.en}
              </option>
            ))}
          </select>

          <textarea
            placeholder={t.contentPlaceholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white"
          />

          <div>
            <label className="flex items-center justify-center gap-2 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white cursor-pointer">
              📷 {imageFile ? imageFile.name : t.choosePhoto}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="bg-orange-500 text-black font-semibold rounded-lg px-4 py-3 disabled:opacity-50"
          >
            {submitting ? t.submitting : t.submit}
          </button>

          <p className="text-xs text-gray-500 text-center">
            {t.agree}{" "}
            <Link href="/terms" className="underline hover:text-orange-400">
              {t.terms}
            </Link>
            .
          </p>
        </form>
      </div>

      <Footer lang={lang} />
    </div>
  );
}