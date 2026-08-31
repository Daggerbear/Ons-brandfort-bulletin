import { supabase } from "@/lib/supabase"

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: business } = await supabase
    .from("businesses")
    .select("name, description, category, logo_url")
    .eq("id", id)
    .single()

  if (!business) {
    return {
      title: "Besigheid",
      description: "Besigheid nie gevind nie.",
    }
  }

  const description = business.description
    ? business.description.slice(0, 160)
    : `${business.name} — ${business.category} in Brandfort.`

  return {
    title: business.name,
    description,
    alternates: {
      canonical: `/business/${id}`,
    },
    openGraph: {
      title: `${business.name} | Ons Brandfort Bulletin`,
      description,
      url: `/business/${id}`,
      images: business.logo_url ? [{ url: business.logo_url }] : undefined,
    },
  }
}

export default function BusinessDetailLayout({ children }) {
  return children
}