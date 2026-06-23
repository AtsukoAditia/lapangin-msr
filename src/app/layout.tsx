import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lapangin",
  description: "Booking lapangan olahraga berbasis web PWA.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
