import { readFile } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";

const CMS_FILE = path.join(process.cwd(), "data", "cms-pages.json");
const SETTINGS_FILE = path.join(process.cwd(), "data", "seo-settings.json");

async function getPage(slug: string) {
  try { return JSON.parse(await readFile(CMS_FILE, "utf-8").catch(() => "{}"))[slug] || null; } catch { return null; }
}
async function getSeo() {
  try { return JSON.parse(await readFile(SETTINGS_FILE, "utf-8").catch(() => "{}")); } catch { return {}; }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("kebijakan");
  return {
    title: page?.metaTitle || "Kebijakan & Privasi — Lapangin",
    description: page?.metaDescription || "Kebijakan privasi dan perlindungan data pengguna Lapangin.",
  };
}

const DEFAULT = `
# Kebijakan & Privasi

Terakhir diperbarui: 12 Juli 2026

## 1. Data yang Kami Kumpulkan

**Data Pendaftaran:**
- Nama lengkap
- Email
- Nomor telepon
- Password (dienkripsi, tidak pernah disimpan plain text)

**Data Booking:**
- Riwayat booking (venue, jam, tanggal)
- Bukti pembayaran yang diupload
- Review dan rating yang diberikan

**Data Teknis:**
- Alamat IP
- Tipe browser dan device
- Halaman yang dikunjungi

## 2. Cara Kami Menggunakan Data

- Memproses booking dan pembayaran
- Mengirim notifikasi booking (WhatsApp, email, push)
- Mengelola akun dan loyalty points
- Meningkatkan layanan dan pengalaman pengguna
- Mencegah fraud dan penyalahgunaan

## 3. Data Sharing

Kami TIDAK menjual data Anda kepada pihak ketiga.

Data dibagikan hanya dengan:
- **Pemilik venue** — nama dan kontak untuk keperluan booking
- **Payment gateway** — data transaksi untuk proses pembayaran
- **Layanan notifikasi** — nomor telepon/email untuk notifikasi

## 4. Keamanan Data

- Semua komunikasi dienkripsi HTTPS
- Password di-hash dengan bcrypt
- JWT token untuk autentikasi session
- Rate limiting untuk mencegah brute force
- Audit log untuk semua aksi penting

## 5. Hak Anda

- **Akses:** Minta salinan data Anda
- **Koreksi:** Perbaiki data yang salah
- **Hapus:** Minta penghapusan akun dan data
- **Export:** Download data Anda dalam format umum

## 6. Retensi Data

- Data akun: disimpan selama akun aktif
- Data booking: disimpan 2 tahun setelah transaksi
- Log teknis: dihapus otomatis setelah 90 hari

## 7. Cookie

Kami menggunakan cookie untuk:
- Autentikasi session (httpOnly cookie)
- Preferensi pengguna (theme, bahasa)
- Analytics (anonymized)

## 8. Kontak

Untuk pertanyaan tentang privasi: [privacy@lapangin.id](mailto:privacy@lapangin.id)

## 9. Perubahan Kebijakan

Kebijakan ini dapat berubah sewaktu-waktu. Perubahan signifikan akan diinformasikan via email atau notifikasi in-app.
`;

export default async function KebijakanPage() {
  const page = await getPage("kebijakan");
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
              if (line.startsWith("- ")) return <li key={i} className="text-gray-600 ml-4 mb-1">{line.slice(2)}</li>;
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
