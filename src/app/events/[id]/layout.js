import { supabase } from "@/lib/supabase"

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: event } = await supabase
    .from("events")
    .select("title, description, date, location, image_url")
    .eq("id", id)
    .single()

  if (!event) {
    return {
      title: "Gebeurtenis",
      description: "Gebeurtenis nie gevind nie.",
    }
  }

  const description = event.description
    ? event.description.slice(0, 160)
    : `${event.title} — ${event.date}${event.location ? ` by ${event.location}` : ""}.`

  return {
    title: event.title,
    description,
    alternates: {
      canonical: `/events/${id}`,
    },
    openGraph: {
      title: `${event.title} | Ons Brandfort Bulletin`,
      description,
      url: `/events/${id}`,
      images: event.image_url ? [{ url: event.image_url }] : undefined,
    },
  }
}

export default function EventDetailLayout({ children }) {
  return children
}