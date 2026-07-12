import { readFile } from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";

const CMS_FILE = path.join(process.cwd(), "data", "cms-pages.json");

async function getPage(slug: string) {
  try { return JSON.parse(await readFile(CMS_FILE, "utf-8").catch(() => "{}"))[slug] || null; } catch { return null; }
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("syarat");
  return {
    title: page?.metaTitle || "Syarat & Ketentuan — Lapangin",
    description: page?.metaDescription || "Syarat dan ketentuan penggunaan platform Lapangin.",
  };
}

const DEFAULT = `
# Syarat & Ketentuan

Terakhir diperbarui: 12 Juli 2026

## Ketentuan Umum

Dengan menggunakan Lapangin, Anda menyetujui syarat dan ketentuan berikut.

## Untuk Pemain (Customer)

### Pendaftaran
- Usia minimal 17 tahun atau memiliki izin orang tua
- Data yang diberikan harus benar dan dapat diverifikasi
- Satu akun per orang — dilarang membuat akun ganda
- Password harus kuat (minimal 8 karakter, kombinasi huruf dan angka)

### Booking
- Booking bersifat sementara hingga pembayaran dikonfirmasi
- Booking yang tidak dibayar dalam 15 menit akan otomatis kadaluarsa
- Bukti pembayaran harus diupload setelah melakukan transfer
- Booking yang sudah dikonfirmasi tidak dapat dibatalkan tanpa penalti

### Pembayaran
- Pembayaran dilakukan via transfer bank, e-wallet, atau QRIS
- Bukti pembayaran yang diupload harus jelas dan asli
- Manipulasi bukti pembayaran = banned permanen

### Loyalty & Reward
- Poin hanya diberikan setelah booking dikonfirmasi
- Poin dapat ditukar dengan reward yang tersedia
- Poin yang sudah kadaluarsa tidak dapat diklaim kembali
- Lapangin berhak menyesuaikan poin jika terjadi kesalahan

### Referral
- Kode referral bersifat unik per akun
- Poin referral diberikan setelah referral pertama berhasil
- Dilarang menyalahgunakan sistem referral (fake accounts, dll)

### Kewajiban Pemain
- Datang tepat waktu sesuai jadwal booking
- Menjaga kebersihan dan fasilitas venue
- Menghormati pemilik lapangan dan pemain lain
- Tidak melakukan vandalisme atau tindakan merusak

## Untuk Pemilik Lapangan (Owner)

### Pendaftaran
- Harus memiliki usaha venue olahraga yang valid
- Data bisnis harus benar dan dapat diverifikasi
- Pendaftaran akan diverifikasi oleh tim Lapangin (1-3 hari kerja)
- Status akun: pending → active (setelah disetujui)

### Pengelolaan Venue
- Informasi venue harus akurat (alamat, foto, harga, jam operasional)
- Harga yang tercantum adalah harga final (tidak boleh ada biaya tersembunyi)
- Ketersediaan slot harus selalu diperbarui
- Venue yang tidak aktif dalam 90 hari dapat ditandai suspend

### Booking & Pembayaran
- Owner wajib mengkonfirmasi booking yang sudah dibayar
- Pembayaran dari customer akan diteruskan ke owner (setelah dipotong platform fee)
- Owner dapat menolak booking dengan alasan yang valid
- Rekening tujuan pembayaran harus atas nama bisnis yang terdaftar

### Data & Kontak
- Owner bertanggung jawab atas data customer yang diterima
- Dilarang menyebarkan data customer ke pihak lain
- Kontak customer hanya untuk keperluan booking

## Untuk Semua Pengguna

### Larangan
- Menggunakan platform untuk aktivitas ilegal
- Manipulasi data, bukti pembayaran, atau review
- Spam, abuse, atau harassment terhadap pengguna lain
- Menggunakan bot atau script otomatis
- Reverse engineering atau exploitasi celah keamanan

### Hak Lapangin
- Menangguhkan atau menghapus akun yang melanggar
- Mengubah syarat dan ketentuan sewaktu-waktu
- Menolak atau membatalkan booking yang mencurigakan
- Mengambil tindakan hukum untuk pelanggaran serius

### Batasan Tanggung Jawab
- Lapangin adalah platform perantara, bukan penyedia venue
- Kualitas venue adalah tanggung jawab owner
- Sengketa antara pemain dan owner harus diselesaikan secara musyawarah
- Lapangin akan memediasi jika diperlukan

### Ganti Rugi
- Maksimal ganti rugi = nilai booking yang bersangkutan
- Lapangin tidak bertanggung jawab atas kerugian tidak langsung
- Force majeure (bencana alam, pandemi, dll) dikecualikan

## Hukum yang Berlaku

Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia.
Sengketa akan diselesaikan di pengadilan Jakarta Selatan.

## Kontak

Pertanyaan tentang syarat & ketentuan: [legal@lapangin.id](mailto:legal@lapangin.id)
`;

export default async function SyaratPage() {
  const page = await getPage("syarat");
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
              if (line.startsWith("### ")) return <h3 key={i} className="text-lg font-semibold text-gray-900 mt-6 mb-2">{line.slice(4)}</h3>;
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
