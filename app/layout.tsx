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
