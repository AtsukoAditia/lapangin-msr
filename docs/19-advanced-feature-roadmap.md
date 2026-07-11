# 19 — Advanced Feature Roadmap (Next Plan)

**Date:** 2026-07-11
**Status:** 📋 Planned — Future Development

---

## 🚀 Overview

Saran fitur advance berdasarkan analisis sistem yang udah ada. Beberapa udah punya foundation (loyalty points, venue owner system, notification logs).

---

## 🏆 1. Social & Community Layer

### a. Open Play / Sparring Matchmaking
- Customer bikin session "butuh 2 orang buat futsal jam 8 malam"
- Orang lain bisa join, bayar split
- Sistem team matching berdasarkan skill level
- **Killer feature** buat market Indonesia — banyak yang mau main tapi gak punya tim lengkap

**Foundation:** `customers` table, `bookings` table

### b. Player Profile & Stats
- Statistik per customer: total jam main, olahraga favorit, win rate
- Badge/achievement: "100 Jam Main", "Futsal King", "Regular Player"
- Public profile (opt-in) biar bisa connect sama player lain

**Foundation:** `loyalty_transactions`, `bookings` history

### c. Review & Rating
- Customer bisa rate venue/courts setelah booking selesai
- Foto upload + review text
- Venue rating aggregate di listing
- Bikin venue owner motivated maintain kualitas

**Foundation:** `customers`, `venues`, `bookings` (completed status)

**New tables needed:** `reviews`, `review_photos`

---

## 💰 2. Revenue & Monetization

### a. Dynamic Pricing Engine
- Harga otomatis naik/turun berdasarkan demand (peak hours = lebih mahal)
- Early bird discount (booking H-7 = diskon 10%)
- Last-minute deals (slot kosong 2 jam sebelum = harga turun)
- Langsung nambah revenue buat venue owner

**Foundation:** `pricing_rules` table (already exists)

### b. Subscription / Membership Plans
- "Paket Bulanan" — bayar Rp 500rb, bisa main 8x di venue partner
- Corporate membership buat company outing/team building
- Auto-recurring billing

**New tables needed:** `subscription_plans`, `subscriptions`, `subscription_usage`

### c. Advertising & Promoted Venues
- Venue owner bisa bayar buat "featured" di homepage
- Banner ads di halaman booking
- Sponsor integration buat turnamen

**New tables needed:** `advertisements`, `promoted_venues`

---

## 📊 3. Owner Dashboard — Supercharged

### a. Revenue Analytics
- Grafik revenue per hari/minggu/bulan
- Court utilization rate (berapa % slot terisi)
- Peak hours heatmap
- Revenue per court, per sport
- Export ke Excel/PDF

**Foundation:** `bookings` data (already has all needed fields)

### b. Multi-Outlet Management
- Owner punya 3 venue berbeda → manage dari 1 dashboard
- Staff management: assign staff ke venue tertentu
- Permission per staff (hanya bisa approve booking, gak bisa edit harga)

**Foundation:** `venue_owners`, `admins` (role field)

### c. Automated Scheduling
- Auto-block court saat maintenance
- Recurring booking untuk pelanggan tetap ("setiap Selasa jam 7-9 malam")
- Waitlist: slot penuh → customer masuk waiting list → auto-notify kalau ada cancel

**Foundation:** `blocked_slots`, `bookings`

**New tables needed:** `recurring_bookings`, `waitlist`

---

## 🔔 4. Notification — Real Delivery

### a. WhatsApp Business API
- Booking confirmation, payment reminder, receipt → via WhatsApp
- Reminder H-1 sebelum booking
- Rating request setelah booking selesai
- **Wajib** buat market Indonesia, hampir semua pakai WA

**Foundation:** `notification_logs` (already exists)

### b. Push Notification (PWA)
- "Booking lo jam 8 malam, 2 jam lagi!"
- "Venue favorit lo lagi ada promo"
- Real-time notification saat admin confirm payment

**Foundation:** PWA manifest & service worker (already exists)

### c. Email Digest
- Weekly recap buat customer: "Minggu ini lo main 3x, kumpulin 150 poin!"
- Monthly report buat owner: "Revenue Juli: Rp 12.5jt, naik 15% dari Juni"

**Foundation:** `notification_logs`, `loyalty_transactions`, `bookings`

---

## 🎮 5. Gamification & Engagement

### a. Leaderboard
- Top players per venue (berdasarkan jam main / poin)
- Top venues di kota tertentu
- Weekly challenge: "Main 3x minggu ini, bonus 50 poin"

**Foundation:** `loyalty_transactions`, `bookings`, `customers`

### b. Referral Program
- "Ajak teman, lo dapet 100 poin, teman dapet diskon 20%"
- Referral tracking + unique code per customer
- Tiered rewards: 5 referral = Silver fast-track

**New tables needed:** `referrals`, `referral_rewards`

### c. Achievement System
- 🏅 "First Timer" — booking pertama
- ⚡ "Night Owl" — 10x booking malam
- 🎯 "Consistent" — main setiap minggu selama 1 bulan
- 👑 "Venue Explorer" — booking di 5 venue berbeda

**New tables needed:** `achievements`, `customer_achievements`

---

## 🗺️ 6. Discovery & Map

### a. Map View
- Venue di-map pakai Mapbox/Leaflet
- Filter by radius: "venue terdekat dari lokasi gue"
- Real-time availability indicator di map

**Foundation:** `venues` (address, maps_url fields)

### b. Venue Photo Gallery
- Owner upload foto lapangan, fasilitas, parkir
- Virtual tour / 360° photo (nanti)
- Foto dari customer review

**New tables needed:** `venue_photos`

### c. Smart Search & Filter
- Filter: harga range, indoor/outdoor, rating, fasilitas (parkir, mushola, kantin)
- Sort: terdekat, termurah, rating tertinggi, tersedia sekarang
- Saved searches / favorite venues

**Foundation:** `venues` (facilities JSONB field)

**New tables needed:** `customer_favorites`

---

## 📊 New Tables Summary

| Priority | Table | Module |
|----------|-------|--------|
| High | `reviews` | Review & Rating |
| High | `review_photos` | Review & Rating |
| High | `subscription_plans` | Membership |
| High | `subscriptions` | Membership |
| High | `subscription_usage` | Membership |
| Medium | `recurring_bookings` | Automated Scheduling |
| Medium | `waitlist` | Automated Scheduling |
| Medium | `referrals` | Referral Program |
| Medium | `referral_rewards` | Referral Program |
| Medium | `achievements` | Achievement System |
| Medium | `customer_achievements` | Achievement System |
| Medium | `venue_photos` | Photo Gallery |
| Low | `customer_favorites` | Smart Search |
| Low | `advertisements` | Advertising |
| Low | `promoted_venues` | Promoted Venues |
| Low | `open_play_sessions` | Sparring Matchmaking |
| Low | `open_play_participants` | Sparring Matchmaking |

---

## 🗓️ Suggested Sprint Prioritization

### Sprint 6 — Review & Rating (Quick Win)
- Reviews table + API
- Star rating UI on venue detail
- Aggregate rating on venue listing
- Photo upload in review

### Sprint 7 — Revenue Analytics Dashboard
- Revenue charts (daily/weekly/monthly)
- Court utilization rate
- Peak hours heatmap
- Export to Excel/PDF

### Sprint 8 — Dynamic Pricing
- Demand-based pricing rules
- Early bird discount
- Last-minute deals

### Sprint 9 — WhatsApp Notification
- WhatsApp Business API integration
- Booking confirmation via WA
- Payment reminder H-1
- Rating request post-booking

### Sprint 10 — Subscription/Membership
- Subscription plans CRUD
- Customer subscription flow
- Usage tracking
- Corporate membership

### Sprint 11 — Referral & Achievement
- Referral code system
- Achievement triggers
- Leaderboard page
- Badge display on profile

### Sprint 12 — Map & Discovery
- Mapbox/Leaflet integration
- Venue markers on map
- Radius search
- Photo gallery

### Sprint 13 — Open Play Matchmaking
- Open play session CRUD
- Join/split payment
- Skill level matching
- Team formation

---

## Dependencies & Notes

1. **WhatsApp Business API** — butuh daftar Meta Business, approval, dan biaya per message
2. **Mapbox** — butuh API key, ada free tier (50k loads/bulan)
3. **Dynamic Pricing** — bisa mulai simple (rule-based), nanti pakai ML
4. **Photo Upload** — butuh storage solution (S3/Cloudflare R2/local)
5. **Push Notification** — butuh VAPID keys untuk Web Push

---

*Document created: 2026-07-11*
*Next review: When current features are stable*
