import Link from "next/link";
import SafeImage from "@/components/SafeImage";

const LABELS = {
  Special: { af: "Spesiaal", en: "Special", icon: "🔥" },
  "New Stock": { af: "Nuwe Voorraad", en: "New Stock", icon: "📦" },
  Menu: { af: "Spyskaart", en: "Menu", icon: "🍽️" },
  Offer: { af: "Aanbod", en: "Offer", icon: "🏷️" },
  Announcement: { af: "Aankondiging", en: "Announcement", icon: "📣" },
};

const text = {
  af: { title: "Nuutste Opdaterings", seeAll: "Sien alle opdaterings →" },
  en: { title: "Latest Updates", seeAll: "See all updates →" },
};

export default function BusinessUpdates({ updates, lang }) {
  if (!updates || updates.length === 0) return null;
  const t = text[lang];

  return (
    <div className="bg-neutral-900/50 border border-amber-500/20 rounded-2xl p-5 mb-6">
      <h2 className="text-xl font-bold mb-4">📢 {t.title}</h2>
      <div className="space-y-3">
        {updates.map((u) => {
          const label = LABELS[u.category];
          return (
            <div
              key={u.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
            >
              {u.image_url && (
                <div className="relative w-full h-44 bg-neutral-950">
                  <SafeImage
                    src={u.image_url}
                    alt={u.title}
                    fill
                    sizes="(max-width: 512px) 100vw, 512px"
                    className="object-contain"
                  />
                </div>
              )}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-sm">{u.title}</span>
                  {label && (
                    <span className="ml-auto text-xs text-amber-400 border border-amber-500/40 rounded-full px-2 py-0.5 flex-shrink-0">
                      {label.icon} {label[lang]}
                    </span>
                  )}
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-line break-words">
                  {u.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <Link
        href="/business-updates"
        className="block text-center text-sm text-amber-400 hover:text-amber-300 mt-4"
      >
        {t.seeAll}
      </Link>
    </div>
  );
}