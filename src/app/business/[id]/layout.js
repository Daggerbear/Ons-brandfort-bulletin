import { supabase } from "@/lib/supabase"

const SITE_URL = "https://ons-brandfort-bulletin.vercel.app"

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: business } = await supabase
    .from("businesses")
    .select("name, description, category, logo_url")
    .eq("id", id)
    .eq("Status", "approved")
    .maybeSingle()

  if (!business) {
    return {
      metadataBase: new URL(SITE_URL),
      title: "Besigheid",
      description: "Besigheid nie gevind nie.",
    }
  }

  const description = business.description
    ? business.description.slice(0, 160)
    : `${business.name} — ${business.category} in Brandfort.`

  const image = business.logo_url || `${SITE_URL}/logo.png`

  return {
    metadataBase: new URL(SITE_URL),
    title: business.name,
    description,
    alternates: {
      canonical: `/business/${id}`,
    },
    openGraph: {
      title: `${business.name} | Ons Brandfort Bulletin`,
      description,
      url: `/business/${id}`,
      siteName: "Ons Brandfort Bulletin",
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary",
      title: `${business.name} | Ons Brandfort Bulletin`,
      description,
      images: [image],
    },
  }
}

export default function BusinessDetailLayout({ children }) {
  return children
}