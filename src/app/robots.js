// src/app/robots.js
export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://ons-brandfort-bulletin.vercel.app/sitemap.xml',
  }
}
