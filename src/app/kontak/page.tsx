import { readFile } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";

const CMS_FILE = path.join(process.cwd(), "data", "cms-pages.json");

async function getPage(slug: string) {
  try { return JSON.parse(await readFile(CMS_FILE, "utf-8").catch(() => "{}"))[slug] || null; } catch { return null; }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("kontak");
  return {
    title: page?.metaTitle || "Kontak — Lapangin",
    description: page?.metaDescription || "Hubungi tim Lapangin untuk pertanyaan, saran, atau kerjasama.",
  };
}

const DEFAULT = `
# Kontak Kami

Kami siap membantu Anda! Hubungi kami melalui channel berikut.

## Email
- **Umum:** info@lapangin.id
- **Support:** support@lapangin.id
- **Kerjasama:** partnership@lapangin.id
- **Privasi:** privacy@lapangin.id
- **Legal:** legal@lapangin.id

## Media Sosial
- **Instagram:** @lapangin.id
- **Twitter/X:** @lapangin_id
- **TikTok:** @lapangin.id
- **Facebook:** Lapangin Indonesia

## WhatsApp
+62 812-3456-7890 (Chat only, Senin-Jumat 09:00-17:00 WIB)

## Alamat
Lapangin Indonesia
Jakarta Selatan, DKI Jakarta
Indonesia

## Jam Operasional Support
Senin - Jumat: 09:00 - 17:00 WIB
Sabtu: 09:00 - 14:00 WIB
Minggu & Hari Libur: Tutup

## FAQ Cepat

**Q: Booking saya belum dikonfirmasi?**
A: Hubungi owner venue via WhatsApp yang tertera di halaman venue. Atau hubungi support kami.

**Q: Bukti pembayaran ditolak?**
A: Upload ulang bukti yang lebih jelas. Pastikan nominal, nama, dan tanggal terlihat.

**Q: Ingin daftarkan venue saya?**
A: Kunjungi /dashboard/register atau hubungi partnership@lapangin.id

**Q: Ada bug atau error?**
A: Laporkan ke support@lapangin.id dengan screenshot dan langkah reproduksi.
`;

export default async function KontakPage() {
  const page = await getPage("kontak");
  const content = page?.content || DEFAULT;

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
          <div className="prose prose-gray max-w-none">
            {content.split("\n").map((line: string, i: number) => {
              if (line.startsWith("# ")) return <h1 key={i} className="text-3xl font-black text-gray-900 mb-4">{line.slice(2)}</h1>;
              if (line.startsWith("## ")) return <h2 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">{line.slice(3)}</h2>;
              if (line.startsWith("**Q:")) return <p key={i} className="text-gray-800 font-semibold mb-1">{line.replace(/\*\*/g, "")}</p>;
              if (line.startsWith("A:")) return <p key={i} className="text-gray-600 mb-4 ml-4">{line}</p>;
              if (line.startsWith("- ")) {
                const text = line.slice(2);
                const parts = text.split(":");
                if (parts.length > 1) {
                  return <li key={i} className="text-gray-600 ml-4 mb-1"><strong>{parts[0]}:</strong>{parts.slice(1).join(":")}</li>;
                }
                return <li key={i} className="text-gray-600 ml-4 mb-1">{text}</li>;
              }
              if (line.trim() === "") return <br key={i} />;
              return <p key={i} className="text-gray-600 mb-3 leading-relaxed">{line}</p>;
            })}
          </div>
        </article>
        <div className="mt-6 text-center">
          <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">← Kembali ke Beranda</Link>
        </div>
      </main>
    </div>
  );
}
