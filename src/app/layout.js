import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://ons-brandfort-bulletin.vercel.app"),
  title: {
    default: "Ons Brandfort Bulletin",
    template: "%s | Ons Brandfort Bulletin",
  },
  description: "Brandfort se gemeenskapsplatform / Brandfort's community platform",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Ons Brandfort Bulletin",
    description: "Die hart van Brandfort, op een plek.",
    url: "https://ons-brandfort-bulletin.vercel.app",
    siteName: "Ons Brandfort Bulletin",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ons Brandfort Bulletin",
      },
    ],
    locale: "af_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ons Brandfort Bulletin",
    description: "Die hart van Brandfort, op een plek.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport = {
  themeColor: "#ff6a00",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}