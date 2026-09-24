// app/sitemap.js
import { supabase } from '@/lib/supabase'

// Rebuild the sitemap at most once an hour
export const revalidate = 3600

export default async function sitemap() {
  const baseUrl = 'https://ons-brandfort-bulletin.vercel.app'

  const routes = [
    '',
    '/vind',
    '/besighede',
    '/feed',
    '/classifieds',
    '/jobs',
    '/emergency',
    '/business-updates',
    '/business-updates/submit',
    '/list-your-business',
    '/list-your-event',
    '/terms',
    '/privacy',
    '/mission',
    '/contact',
    '/games',
    '/games/battleship',
    '/games/chess',
    '/games/sudoku',
    '/games/checkers',
    '/games/riddle-rush',
    '/games/block-rush',
    '/games/whack-a-mole',
    '/games/snake',
    '/games/brick-breaker',
    '/games/merge-rush',
  ]

  const staticRoutes = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))

  let businessRoutes = []
  let eventRoutes = []

  try {
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id')
      .eq('Status', 'approved')

    businessRoutes = (businesses || []).map((b) => ({
      url: `${baseUrl}/business/${b.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (e) {
    console.error('Sitemap: businesses fetch failed', e)
  }

  try {
    const { data: events } = await supabase
      .from('events')
      .select('id')
      .eq('status', 'approved')

    eventRoutes = (events || []).map((ev) => ({
      url: `${baseUrl}/events/${ev.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch (e) {
    console.error('Sitemap: events fetch failed', e)
  }

  return [...staticRoutes, ...businessRoutes, ...eventRoutes]
}
