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
  title: "CVISOR",
  description: "Platforma ta de carieră și oportunități",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CVISOR",
  },
  formatDetection: {
    telephone: false,
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
    <html lang="en">
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
