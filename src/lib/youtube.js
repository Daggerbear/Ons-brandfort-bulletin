// lib/youtube.js
export function extractYoutubeId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/shorts\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function getYoutubeThumbnail(youtubeId) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}