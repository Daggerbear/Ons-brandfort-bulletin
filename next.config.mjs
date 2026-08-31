/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xasiwsjeiblpikijurgm.supabase.co",
      },
    ],
    deviceSizes: [640, 828, 1080],
    imageSizes: [64, 96, 128, 256],
    minimumCacheTTL: 2678400,
  },
};

export default nextConfig;