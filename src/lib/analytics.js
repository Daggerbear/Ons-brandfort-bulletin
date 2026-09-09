import { supabase } from "@/lib/supabase";

export async function trackEvent(eventType, { businessId = null, query = null } = {}) {
  try {
    await supabase.from("analytics_events").insert({
      event_type: eventType,
      business_id: businessId,
      query,
    });
  } catch (e) {
    // Analytics should never break the site — fail silently.
  }
}