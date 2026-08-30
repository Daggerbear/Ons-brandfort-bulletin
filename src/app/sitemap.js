export default async function sitemap() {
  const baseUrl = 'https://ons-brandfort-bulletin.vercel.app'

  const staticRoutes = [
    '',
    '/besighede',
    '/feed',
    '/classifieds',
    '/jobs',
    '/emergency',
    '/games',
    '/list-your-business',
    '/list-your-event',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))

  return staticRoutes
}