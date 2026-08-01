import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

const sansFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "The Brief — Mission Control for ambitious nontraditional students",
  description:
    "The Brief reduces the cognitive load of balancing school, work, certifications, and career advancement into one daily briefing.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    // iOS only receives Web Push once the site is added to the Home
    // Screen (iOS 16.4+) — a plain Safari tab can't. This is what makes
    // that possible; it doesn't do anything on its own.
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Brief",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${monoFont.variable} ${sansFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
