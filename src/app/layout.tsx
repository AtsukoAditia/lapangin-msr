import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import InstallPrompt from "@/components/pwa/InstallPrompt";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lapangin — Booking Lapangan Olahraga",
  description:
    "Booking lapangan olahraga lebih cepat, rapi, dan mobile friendly. Futsal, badminton, padel, tenis, basket, dan minisoccer.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lapangin",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${font.className} antialiased`}>
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
