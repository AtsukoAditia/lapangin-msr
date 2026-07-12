import { readFile } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";

const SETTINGS_FILE = path.join(process.cwd(), "data", "seo-settings.json");
const CMS_FILE = path.join(process.cwd(), "data", "cms-pages.json");

async function getPageContent(slug: string) {
  try {
    const raw = await readFile(CMS_FILE, "utf-8").catch(() => "{}");
    const pages = JSON.parse(raw);
    return pages[slug] || null;
  } catch {
    return null;
  }
}

async function getSeoSettings() {
  try {
    const raw = await readFile(SETTINGS_FILE, "utf-8").catch(() => "{}");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function getSeo() {
  try { return JSON.parse(await readFile(SETTINGS_FILE, "utf-8").catch(() => "{}")); } catch { return {}; }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageContent("tentang");
  const seo = await getSeo();
  const siteName = seo.siteName || "Lapangin";
  const title = page?.metaTitle || `Tentang — ${siteName}`;
  const description = page?.metaDescription || "Kenalan sama Lapangin, platform booking lapangan olahraga online terbaik di Indonesia.";
  return {
    title,
    description,
    openGraph: {
      title: page?.ogTitle || seo.ogTitle || title,
      description: page?.ogDescription || seo.ogDescription || description,
      images: page?.ogImage || seo.ogImage ? [page?.ogImage || seo.ogImage] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page?.ogTitle || seo.ogTitle || title,
      description: page?.ogDescription || seo.ogDescription || description,
    },
  };
}

const DEFAULT_CONTENT = `
# Tentang Lapangin

**Lapangin** adalah platform booking lapangan olahraga online yang menghubungkan pemain dengan pemilik lapangan di seluruh Indonesia.

## Misi Kami

Membuat akses ke fasilitas olahraga semudah memesan makanan. Kami percaya bahwa berolahraga harusnya simple — cari, booking, main.

## Apa yang Kami Tawarkan

- 🏟️ **Ribuan lapangan** — futsal, badminton, basket, tenis, padel, mini soccer
- 📍 **Filter lokasi** — cari berdasarkan area/kota/kelurahan
- 💰 **Harga transparan** — lihat harga real-time sebelum booking
- ⏰ **Booking instan** — pilih jam, bayar, langsung main
- 🏆 **Gamifikasi** — kumpulkan poin, tukar reward, naik level
- 🌧️ **Adaptif cuaca** — diskon otomatis untuk lapangan outdoor saat hujan

## Untuk Pemilik Lapangan

Daftarkan venue Anda dan dapatkan:
- Dashboard kelola booking real-time
- Manajemen lapangan dan harga fleksibel
- Statistik dan analitik performa
- Notifikasi otomatis ke pelanggan

## Teknologi

- Next.js 16 + TypeScript
- PostgreSQL 16
- Real-time availability
- PWA support (install di HP)
- HTTPS + security hardening

## Kontak

Hubungi kami di [kontak@lapangin.id](mailto:kontak@lapangin.id) atau kunjungi halaman [Kontak](/kontak).
`;

export default async function TentangPage() {
  const page = await getPageContent("tentang");
  const content = page?.content || DEFAULT_CONTENT;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚡</span>
            </div>
            <span className="text-lg font-black text-gray-900">Lapang<span className="text-emerald-600">in</span></span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-10">
          <div className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-emerald-600 prose-strong:text-gray-900">
            {content.split("\n").map((line: string, i: number) => {
              if (line.startsWith("# ")) return <h1 key={i} className="text-3xl font-black text-gray-900 mb-4">{line.slice(2)}</h1>;
              if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">{line.slice(3)}</h2>;
              if (line.startsWith("- ")) return <li key={i} className="text-gray-600 ml-4 mb-1">{line.slice(2)}</li>;
              if (line.trim() === "") return <br key={i} />;
              return <p key={i} className="text-gray-600 mb-3 leading-relaxed">{line}</p>;
            })}
          </div>
        </article>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/kebijakan", label: "Kebijakan & Privasi", icon: "🔒" },
            { href: "/syarat", label: "Syarat & Ketentuan", icon: "📋" },
            { href: "/kontak", label: "Kontak Kami", icon: "📞" },
            { href: "/", label: "Kembali ke Beranda", icon: "🏠" },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:shadow-md transition-shadow">
              <span className="text-2xl block mb-2">{item.icon}</span>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
