import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CVISOR — Platforma de Oportunități pentru Studenți",
  description: "Prima platformă din România care conectează studenții cu asociațiile studențești. Descoperă oportunități de voluntariat, evenimente, workshopuri și petreceri — totul gratuit!",
  keywords: ["studenți", "oportunități", "voluntariat", "asociații studențești", "Iași", "evenimente", "CVISOR"],
  manifest: "/manifest.json",
  icons: {
    icon: "/albastru.svg",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CVISOR",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "CVISOR — Platforma de Oportunități pentru Studenți",
    description: "Descoperă oportunități de voluntariat, evenimente și workshopuri. Totul gratuit!",
    type: "website",
    locale: "ro_RO",
    siteName: "CVISOR",
  },
};

import { Toaster } from "react-hot-toast";
import CookieConsent from "./components/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <CookieConsent />
        <Toaster position="top-center" reverseOrder={false} />
      </body>
    </html>
  );
}
