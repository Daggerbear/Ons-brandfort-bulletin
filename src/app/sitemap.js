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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))

  return staticRoutes
}