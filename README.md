# ArenaBook Starter Kit

Starter kit awal untuk aplikasi booking lapangan olahraga berbasis web PWA.

Target:

- Demo bisa jalan di Vercel.
- Mobile responsive.
- Admin CMS untuk owner/operator.
- Database awal menggunakan Google Spreadsheet.
- Arsitektur disiapkan agar mudah migrasi ke PostgreSQL/Supabase.
- Cocok untuk futsal, minisoccer, badminton, padel, tenis, basket, dan olahraga lain.

## Stack Rekomendasi

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Google Sheets API untuk database demo
- PostgreSQL/Supabase untuk database production
- Vercel untuk deployment
- PWA manifest + service worker
- Web Push / Email / WhatsApp fallback untuk notifikasi

## Perintah Awal

```bash
npm install
cp .env.example .env.local
npm run dev
```

Buka:

```txt
http://localhost:3000
```

## Mode Development

Gunakan mode bertahap:

1. Static UI dulu.
2. Mock data.
3. Google Spreadsheet adapter.
4. Admin CMS.
5. Booking flow.
6. Notification.
7. PWA.
8. Deployment Vercel.
9. Migrasi PostgreSQL.
