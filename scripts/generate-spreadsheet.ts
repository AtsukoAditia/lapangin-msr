/**
 * Script to generate/seed the Google Spreadsheet for Lapangin.
 * Creates all required sheets with headers and seed data.
 *
 * Usage: npx tsx scripts/generate-spreadsheet.ts
 */

import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local not found at", envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

loadEnv();

const SHEET_DEFINITIONS: Record<string, string[]> = {
  activity_logs: [
    "id", "timestamp", "action", "category", "actor_type", "actor_id", "actor_name",
    "target_type", "target_id", "target_label", "description",
    "metadata", "ip_address", "user_agent",
  ],
  sports: ["id", "name", "slug", "is_active"],
  areas: ["id", "province", "city", "district", "slug", "is_active", "created_at", "updated_at"],
  venue_owners: ["id", "admin_id", "business_name", "pic_name", "phone", "email", "status", "created_at", "updated_at"],
  venues: ["id", "name", "slug", "address", "maps_url", "phone", "open_time", "close_time", "owner_id", "area_id", "approval_status", "is_active"],
  courts: ["id", "venue_id", "sport_id", "name", "slug", "surface_type", "indoor_type", "capacity", "base_price", "is_active"],
  pricing_rules: ["id", "court_id", "day_type", "start_time", "end_time", "price_per_hour", "priority", "is_active"],
  bookings: [
    "id", "booking_code", "customer_name", "customer_phone", "customer_email",
    "venue_id", "court_id", "sport_id", "booking_date", "start_time", "end_time",
    "duration_minutes", "total_price", "booking_status", "payment_status",
    "payment_proof_url", "expires_at", "payment_submitted_at", "payment_verified_at",
    "payment_rejected_at", "payment_rejection_reason", "verified_by_admin_id",
    "notes", "created_at", "updated_at",
  ],
  blocked_slots: ["id", "court_id", "date", "start_time", "end_time", "reason"],
  audit_log: ["id", "timestamp", "action", "target_type", "target_id", "actor_type", "actor_id", "details", "previous_value", "new_value"],
  payment_methods: ["id", "name", "label", "type", "account_name", "account_number", "provider", "details", "instructions", "is_active"],
  notification_logs: [
    "id", "type", "channel", "recipient", "subject", "message",
    "status", "booking_id", "booking_code", "error_message",
    "sent_at", "created_at", "read_at",
  ],
  admin_users: ["id", "name", "email", "password_hash", "role", "is_active", "created_at"],
  customers: ["id", "name", "email", "phone", "password_hash", "loyalty_points", "total_spent", "is_active", "created_at"],
  loyalty_transactions: ["id", "customer_id", "type", "points", "booking_id", "description", "created_at"],
  rewards: ["id", "name", "description", "points_required", "discount_type", "discount_value", "is_active", "created_at"],
  reward_redemptions: ["id", "customer_id", "reward_id", "booking_id", "points_used", "status", "created_at"],
};

// ── Seed Data ──

const now = new Date().toISOString();
const today = "2026-06-25";

const SEED_SPORTS = [
  { id: "sport-futsal", name: "Futsal", slug: "futsal", is_active: "true" },
  { id: "sport-minisoccer", name: "Minisoccer", slug: "minisoccer", is_active: "true" },
  { id: "sport-badminton", name: "Badminton", slug: "badminton", is_active: "true" },
  { id: "sport-padel", name: "Padel", slug: "padel", is_active: "true" },
  { id: "sport-tenis", name: "Tenis", slug: "tenis", is_active: "true" },
  { id: "sport-basket", name: "Basket", slug: "basket", is_active: "true" },
];

const SEED_AREAS = [
  { id: "area-jaksel", province: "DKI Jakarta", city: "Jakarta Selatan", district: "Kebayoran Baru", slug: "jakarta-selatan", is_active: "true", created_at: now, updated_at: now },
  { id: "area-jakpus", province: "DKI Jakarta", city: "Jakarta Pusat", district: "Menteng", slug: "jakarta-pusat", is_active: "true", created_at: now, updated_at: now },
  { id: "area-bdg", province: "Jawa Barat", city: "Bandung", district: "Coblong", slug: "bandung", is_active: "true", created_at: now, updated_at: now },
];

const SEED_VENUE_OWNERS = [
  { id: "owner-1", admin_id: "admin-1", business_name: "Arena Sport Group", pic_name: "Admin Lapangin", phone: "081234567890", email: "admin@lapangin.id", status: "active", created_at: now, updated_at: now },
  { id: "owner-2", admin_id: "", business_name: "Greenfield Sports", pic_name: "Pak Budi", phone: "081298765432", email: "budi@greenfield.id", status: "active", created_at: now, updated_at: now },
];

const SEED_VENUES = [
  {
    id: "venue-arena1", name: "Arena Sport Center", slug: "arena-sport-center",
    address: "Jl. Sudirman No. 123, Jakarta Selatan", maps_url: "https://maps.google.com/?q=-6.2088,106.8456",
    phone: "081234567890", open_time: "06:00", close_time: "23:00",
    owner_id: "owner-1", area_id: "area-jaksel", approval_status: "active", is_active: "true",
  },
  {
    id: "venue-greenfield", name: "Greenfield Arena", slug: "greenfield-arena",
    address: "Jl. Gatot Subroto No. 45, Jakarta Pusat", maps_url: "https://maps.google.com/?q=-6.2100,106.8200",
    phone: "081298765432", open_time: "07:00", close_time: "22:00",
    owner_id: "owner-2", area_id: "area-jakpus", approval_status: "active", is_active: "true",
  },
];

const SEED_COURTS = [
  { id: "court-f1", venue_id: "venue-arena1", sport_id: "sport-futsal", name: "Futsal A", slug: "futsal-a", surface_type: "Sintetis", indoor_type: "indoor", capacity: "10", base_price: "150000", is_active: "true" },
  { id: "court-f2", venue_id: "venue-arena1", sport_id: "sport-futsal", name: "Futsal B", slug: "futsal-b", surface_type: "Vinyl", indoor_type: "indoor", capacity: "10", base_price: "120000", is_active: "true" },
  { id: "court-ms1", venue_id: "venue-arena1", sport_id: "sport-minisoccer", name: "Minisoccer 1", slug: "minisoccer-1", surface_type: "Sintetis", indoor_type: "outdoor", capacity: "14", base_price: "200000", is_active: "true" },
  { id: "court-b1", venue_id: "venue-arena1", sport_id: "sport-badminton", name: "Badminton Court 1", slug: "badminton-1", surface_type: "Vinyl", indoor_type: "indoor", capacity: "4", base_price: "80000", is_active: "true" },
  { id: "court-b2", venue_id: "venue-arena1", sport_id: "sport-badminton", name: "Badminton Court 2", slug: "badminton-2", surface_type: "Vinyl", indoor_type: "indoor", capacity: "4", base_price: "80000", is_active: "true" },
  { id: "court-p1", venue_id: "venue-greenfield", sport_id: "sport-padel", name: "Padel Court 1", slug: "padel-1", surface_type: "Artificial Grass", indoor_type: "outdoor", capacity: "4", base_price: "150000", is_active: "true" },
  { id: "court-t1", venue_id: "venue-greenfield", sport_id: "sport-tenis", name: "Tenis Court 1", slug: "tenis-1", surface_type: "Hard Court", indoor_type: "outdoor", capacity: "4", base_price: "100000", is_active: "true" },
  { id: "court-bsk1", venue_id: "venue-greenfield", sport_id: "sport-basket", name: "Basket Court 1", slug: "basket-1", surface_type: "Hard Court", indoor_type: "outdoor", capacity: "10", base_price: "100000", is_active: "true" },
];

const SEED_PRICING_RULES = [
  // Futsal A - Arena
  { id: "pr-f1-weekday", court_id: "court-f1", day_type: "weekday", start_time: "06:00", end_time: "17:00", price_per_hour: "120000", priority: "1", is_active: "true" },
  { id: "pr-f1-peak", court_id: "court-f1", day_type: "weekday", start_time: "17:00", end_time: "23:00", price_per_hour: "150000", priority: "2", is_active: "true" },
  { id: "pr-f1-weekend", court_id: "court-f1", day_type: "weekend", start_time: "06:00", end_time: "23:00", price_per_hour: "180000", priority: "3", is_active: "true" },
  // Futsal B - Arena
  { id: "pr-f2-weekday", court_id: "court-f2", day_type: "weekday", start_time: "06:00", end_time: "17:00", price_per_hour: "100000", priority: "1", is_active: "true" },
  { id: "pr-f2-peak", court_id: "court-f2", day_type: "weekday", start_time: "17:00", end_time: "23:00", price_per_hour: "120000", priority: "2", is_active: "true" },
  { id: "pr-f2-weekend", court_id: "court-f2", day_type: "weekend", start_time: "06:00", end_time: "23:00", price_per_hour: "150000", priority: "3", is_active: "true" },
  // Minisoccer 1
  { id: "pr-ms1-weekday", court_id: "court-ms1", day_type: "weekday", start_time: "06:00", end_time: "17:00", price_per_hour: "170000", priority: "1", is_active: "true" },
  { id: "pr-ms1-peak", court_id: "court-ms1", day_type: "weekday", start_time: "17:00", end_time: "23:00", price_per_hour: "200000", priority: "2", is_active: "true" },
  { id: "pr-ms1-weekend", court_id: "court-ms1", day_type: "weekend", start_time: "06:00", end_time: "23:00", price_per_hour: "250000", priority: "3", is_active: "true" },
  // Badminton 1
  { id: "pr-b1-weekday", court_id: "court-b1", day_type: "weekday", start_time: "06:00", end_time: "17:00", price_per_hour: "60000", priority: "1", is_active: "true" },
  { id: "pr-b1-peak", court_id: "court-b1", day_type: "weekday", start_time: "17:00", end_time: "23:00", price_per_hour: "80000", priority: "2", is_active: "true" },
  { id: "pr-b1-weekend", court_id: "court-b1", day_type: "weekend", start_time: "06:00", end_time: "23:00", price_per_hour: "100000", priority: "3", is_active: "true" },
  // Badminton 2
  { id: "pr-b2-weekday", court_id: "court-b2", day_type: "weekday", start_time: "06:00", end_time: "17:00", price_per_hour: "60000", priority: "1", is_active: "true" },
  { id: "pr-b2-peak", court_id: "court-b2", day_type: "weekday", start_time: "17:00", end_time: "23:00", price_per_hour: "80000", priority: "2", is_active: "true" },
  { id: "pr-b2-weekend", court_id: "court-b2", day_type: "weekend", start_time: "06:00", end_time: "23:00", price_per_hour: "100000", priority: "3", is_active: "true" },
  // Padel 1
  { id: "pr-p1-weekday", court_id: "court-p1", day_type: "weekday", start_time: "06:00", end_time: "17:00", price_per_hour: "120000", priority: "1", is_active: "true" },
  { id: "pr-p1-peak", court_id: "court-p1", day_type: "weekday", start_time: "17:00", end_time: "22:00", price_per_hour: "150000", priority: "2", is_active: "true" },
  { id: "pr-p1-weekend", court_id: "court-p1", day_type: "weekend", start_time: "07:00", end_time: "22:00", price_per_hour: "180000", priority: "3", is_active: "true" },
  // Tenis 1
  { id: "pr-t1-weekday", court_id: "court-t1", day_type: "weekday", start_time: "07:00", end_time: "17:00", price_per_hour: "80000", priority: "1", is_active: "true" },
  { id: "pr-t1-peak", court_id: "court-t1", day_type: "weekday", start_time: "17:00", end_time: "22:00", price_per_hour: "100000", priority: "2", is_active: "true" },
  { id: "pr-t1-weekend", court_id: "court-t1", day_type: "weekend", start_time: "07:00", end_time: "22:00", price_per_hour: "120000", priority: "3", is_active: "true" },
  // Basket 1
  { id: "pr-bsk1-weekday", court_id: "court-bsk1", day_type: "weekday", start_time: "07:00", end_time: "17:00", price_per_hour: "80000", priority: "1", is_active: "true" },
  { id: "pr-bsk1-peak", court_id: "court-bsk1", day_type: "weekday", start_time: "17:00", end_time: "22:00", price_per_hour: "100000", priority: "2", is_active: "true" },
  { id: "pr-bsk1-weekend", court_id: "court-bsk1", day_type: "weekend", start_time: "07:00", end_time: "22:00", price_per_hour: "120000", priority: "3", is_active: "true" },
];

const SEED_BOOKINGS = [
  {
    id: "bk-001", booking_code: "AB-TEST001", customer_name: "Budi Santoso", customer_phone: "081234567890",
    customer_email: "budi@example.com", venue_id: "venue-arena1", court_id: "court-f1", sport_id: "sport-futsal",
    booking_date: today, start_time: "08:00", end_time: "10:00", duration_minutes: "120",
    total_price: "240000", booking_status: "confirmed", payment_status: "paid",
    payment_proof_url: "", expires_at: "", payment_submitted_at: "", payment_verified_at: now,
    payment_rejected_at: "", payment_rejection_reason: "", verified_by_admin_id: "admin-1",
    notes: "Main bareng teman kantor", created_at: now, updated_at: now,
  },
  {
    id: "bk-002", booking_code: "AB-TEST002", customer_name: "Siti Rahayu", customer_phone: "081298765432",
    customer_email: "siti@example.com", venue_id: "venue-arena1", court_id: "court-b1", sport_id: "sport-badminton",
    booking_date: today, start_time: "17:00", end_time: "19:00", duration_minutes: "120",
    total_price: "160000", booking_status: "waiting_payment", payment_status: "unpaid",
    payment_proof_url: "", expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    payment_submitted_at: "", payment_verified_at: "", payment_rejected_at: "",
    payment_rejection_reason: "", verified_by_admin_id: "",
    notes: "", created_at: now, updated_at: now,
  },
  {
    id: "bk-003", booking_code: "AB-TEST003", customer_name: "Andi Wijaya", customer_phone: "081345678901",
    customer_email: "andi@example.com", venue_id: "venue-greenfield", court_id: "court-p1", sport_id: "sport-padel",
    booking_date: "2026-06-26", start_time: "10:00", end_time: "12:00", duration_minutes: "120",
    total_price: "300000", booking_status: "waiting_verification", payment_status: "waiting_confirmation",
    payment_proof_url: "https://example.com/proof.jpg", expires_at: "",
    payment_submitted_at: now, payment_verified_at: "", payment_rejected_at: "",
    payment_rejection_reason: "", verified_by_admin_id: "",
    notes: "Booking pagi", created_at: now, updated_at: now,
  },
  {
    id: "bk-004", booking_code: "AB-TEST004", customer_name: "Dewi Lestari", customer_phone: "081567890123",
    customer_email: "dewi@example.com", venue_id: "venue-arena1", court_id: "court-ms1", sport_id: "sport-minisoccer",
    booking_date: "2026-06-27", start_time: "15:00", end_time: "17:00", duration_minutes: "120",
    total_price: "400000", booking_status: "confirmed", payment_status: "paid",
    payment_proof_url: "", expires_at: "", payment_submitted_at: now, payment_verified_at: now,
    payment_rejected_at: "", payment_rejection_reason: "", verified_by_admin_id: "admin-1",
    notes: "", created_at: now, updated_at: now,
  },
  {
    id: "bk-005", booking_code: "AB-TEST005", customer_name: "Rizky Pratama", customer_phone: "081678901234",
    customer_email: "", venue_id: "venue-greenfield", court_id: "court-t1", sport_id: "sport-tenis",
    booking_date: today, start_time: "07:00", end_time: "09:00", duration_minutes: "120",
    total_price: "200000", booking_status: "cancelled", payment_status: "refunded",
    payment_proof_url: "", expires_at: "", payment_submitted_at: "", payment_verified_at: "",
    payment_rejected_at: "", payment_rejection_reason: "", verified_by_admin_id: "",
    notes: "Batal karena hujan", created_at: now, updated_at: now,
  },
];

const SEED_BLOCKED_SLOTS = [
  { id: "bs-001", court_id: "court-f1", date: "2026-06-28", start_time: "10:00", end_time: "12:00", reason: "Maintenance lapangan" },
  { id: "bs-002", court_id: "court-b1", date: "2026-06-29", start_time: "14:00", end_time: "16:00", reason: "Event internal" },
];

const SEED_AUDIT_LOG = [
  {
    id: "al-001", timestamp: now, action: "booking_confirmed", target_type: "booking",
    target_id: "bk-001", actor_type: "admin", actor_id: "admin-1",
    details: "Booking AB-TEST001 dikonfirmasi oleh admin", previous_value: "pending", new_value: "confirmed",
  },
  {
    id: "al-002", timestamp: now, action: "booking_cancelled", target_type: "booking",
    target_id: "bk-005", actor_type: "customer", actor_id: "",
    details: "Booking AB-TEST005 dibatalkan oleh customer", previous_value: "confirmed", new_value: "cancelled",
  },
];

const SEED_PAYMENT_METHODS = [
  {
    id: "pm-bca", name: "BCA Transfer", label: "Transfer BCA", type: "bank_transfer",
    account_name: "PT Lapangin Indonesia", account_number: "1234567890", provider: "BCA",
    details: "Bank Central Asia", instructions: "Transfer ke rekening BCA di atas, lalu upload bukti transfer.",
    is_active: "true",
  },
  {
    id: "pm-mandiri", name: "Mandiri Transfer", label: "Transfer Mandiri", type: "bank_transfer",
    account_name: "PT Lapangin Indonesia", account_number: "0987654321", provider: "Mandiri",
    details: "Bank Mandiri", instructions: "Transfer ke rekening Mandiri di atas, lalu upload bukti transfer.",
    is_active: "true",
  },
  {
    id: "pm-gopay", name: "GoPay", label: "GoPay", type: "ewallet",
    account_name: "Lapangin", account_number: "081234567890", provider: "GoPay",
    details: "E-Wallet GoPay", instructions: "Scan QR atau transfer ke nomor GoPay di atas.",
    is_active: "true",
  },
  {
    id: "pm-ovo", name: "OVO", label: "OVO", type: "ewallet",
    account_name: "Lapangin", account_number: "081234567890", provider: "OVO",
    details: "E-Wallet OVO", instructions: "Transfer ke nomor OVO di atas, lalu upload bukti transfer.",
    is_active: "true",
  },
];

const SEED_NOTIFICATION_LOGS = [
  {
    id: "notif-001", type: "booking_confirmed", channel: "whatsapp", recipient: "081234567890",
    subject: "", message: "Halo Budi, booking AB-TEST001 sudah dikonfirmasi. Futsal A, 25 Jun 2026 08:00-10:00.",
    status: "sent", booking_id: "bk-001", booking_code: "AB-TEST001", error_message: "",
    sent_at: now, created_at: now, read_at: "",
  },
  {
    id: "notif-002", type: "booking_created", channel: "whatsapp", recipient: "081298765432",
    subject: "", message: "Halo Siti, booking AB-TEST002 berhasil dibuat. Silakan lakukan pembayaran.",
    status: "sent", booking_id: "bk-002", booking_code: "AB-TEST002", error_message: "",
    sent_at: now, created_at: now, read_at: "",
  },
];

const SEED_ADMIN_USERS = [
  {
    id: "admin-1", name: "Admin Lapangin", email: "admin@lapangin.id",
    password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjfdGECygmbBKl6LOBhG.aP5bJkRi", // password: admin123
    role: "admin", is_active: "true", created_at: now,
  },
];

const SEED_CUSTOMERS = [
  {
    id: "cust-001", name: "Budi Santoso", email: "budi@example.com", phone: "081234567890",
    password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjfdGECygmbBKl6LOBhG.aP5bJkRi",
    loyalty_points: "150", total_spent: "500000", is_active: "true", created_at: now,
  },
  {
    id: "cust-002", name: "Siti Rahayu", email: "siti@example.com", phone: "081298765432",
    password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjfdGECygmbBKl6LOBhG.aP5bJkRi",
    loyalty_points: "80", total_spent: "320000", is_active: "true", created_at: now,
  },
  {
    id: "cust-003", name: "Andi Wijaya", email: "andi@example.com", phone: "081345678901",
    password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMye.IjfdGECygmbBKl6LOBhG.aP5bJkRi",
    loyalty_points: "50", total_spent: "150000", is_active: "true", created_at: now,
  },
];

const SEED_LOYALTY_TRANSACTIONS = [
  { id: "lt-001", customer_id: "cust-001", type: "earn", points: "50", booking_id: "bk-001", description: "Poin dari booking AB-TEST001", created_at: now },
  { id: "lt-002", customer_id: "cust-001", type: "earn", points: "100", booking_id: "", description: "Bonus pendaftaran", created_at: now },
  { id: "lt-003", customer_id: "cust-002", type: "earn", points: "80", booking_id: "", description: "Bonus pendaftaran", created_at: now },
  { id: "lt-004", customer_id: "cust-003", type: "earn", points: "50", booking_id: "", description: "Bonus pendaftaran", created_at: now },
];

const SEED_REWARDS = [
  {
    id: "reward-001", name: "Diskon 10%", description: "Diskon 10% untuk booking berikutnya",
    points_required: "100", discount_type: "percentage", discount_value: "10",
    is_active: "true", created_at: now,
  },
  {
    id: "reward-002", name: "Diskon Rp 25.000", description: "Potongan Rp 25.000 untuk booking",
    points_required: "150", discount_type: "fixed", discount_value: "25000",
    is_active: "true", created_at: now,
  },
  {
    id: "reward-003", name: "Diskon 20%", description: "Diskon 20% untuk booking weekend",
    points_required: "300", discount_type: "percentage", discount_value: "20",
    is_active: "true", created_at: now,
  },
];

const SEED_REWARD_REDEMPTIONS: Record<string, string>[] = [];

// ── Activity Logs (all web app actions) ──

const SEED_ACTIVITY_LOGS = [
  // === AUTH - Customer ===
  {
    id: "act-001", timestamp: "2026-06-24T06:00:00.000Z", action: "customer_register",
    category: "auth", actor_type: "customer", actor_id: "cust-001", actor_name: "Budi Santoso",
    target_type: "customer", target_id: "cust-001", target_label: "budi@example.com",
    description: "Pelanggan baru mendaftar: Budi Santoso (budi@example.com)",
    metadata: '{"email":"budi@example.com","phone":"081234567890"}',
    ip_address: "103.12.45.100", user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  },
  {
    id: "act-002", timestamp: "2026-06-24T06:05:00.000Z", action: "customer_register",
    category: "auth", actor_type: "customer", actor_id: "cust-002", actor_name: "Siti Rahayu",
    target_type: "customer", target_id: "cust-002", target_label: "siti@example.com",
    description: "Pelanggan baru mendaftar: Siti Rahayu (siti@example.com)",
    metadata: '{"email":"siti@example.com","phone":"081298765432"}',
    ip_address: "114.122.55.200", user_agent: "Mozilla/5.0 (Android 14; SM-S918B)",
  },
  {
    id: "act-003", timestamp: "2026-06-24T07:10:00.000Z", action: "customer_login",
    category: "auth", actor_type: "customer", actor_id: "cust-001", actor_name: "Budi Santoso",
    target_type: "customer", target_id: "cust-001", target_label: "budi@example.com",
    description: "Budi Santoso berhasil login",
    metadata: "{}",
    ip_address: "103.12.45.100", user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  },
  {
    id: "act-004", timestamp: "2026-06-24T07:15:00.000Z", action: "customer_login",
    category: "auth", actor_type: "customer", actor_id: "cust-002", actor_name: "Siti Rahayu",
    target_type: "customer", target_id: "cust-002", target_label: "siti@example.com",
    description: "Siti Rahayu berhasil login",
    metadata: "{}",
    ip_address: "114.122.55.200", user_agent: "Mozilla/5.0 (Android 14; SM-S918B)",
  },
  {
    id: "act-005", timestamp: "2026-06-24T07:20:00.000Z", action: "customer_login",
    category: "auth", actor_type: "customer", actor_id: "cust-003", actor_name: "Andi Wijaya",
    target_type: "customer", target_id: "cust-003", target_label: "andi@example.com",
    description: "Andi Wijaya berhasil login",
    metadata: "{}",
    ip_address: "36.68.210.50", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "act-006", timestamp: "2026-06-25T14:00:00.000Z", action: "customer_logout",
    category: "auth", actor_type: "customer", actor_id: "cust-001", actor_name: "Budi Santoso",
    target_type: "customer", target_id: "cust-001", target_label: "budi@example.com",
    description: "Budi Santoso logout",
    metadata: "{}",
    ip_address: "103.12.45.100", user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  },

  // === AUTH - Admin ===
  {
    id: "act-007", timestamp: "2026-06-24T05:30:00.000Z", action: "admin_login",
    category: "auth", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "admin", target_id: "admin-1", target_label: "admin@lapangin.id",
    description: "Admin Lapangin berhasil login ke panel admin",
    metadata: '{"role":"admin"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-008", timestamp: "2026-06-25T17:00:00.000Z", action: "admin_logout",
    category: "auth", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "admin", target_id: "admin-1", target_label: "admin@lapangin.id",
    description: "Admin Lapangin logout dari panel admin",
    metadata: "{}",
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },

  // === BOOKING - Customer ===
  {
    id: "act-009", timestamp: "2026-06-24T07:30:00.000Z", action: "booking_created",
    category: "booking", actor_type: "customer", actor_id: "cust-001", actor_name: "Budi Santoso",
    target_type: "booking", target_id: "bk-001", target_label: "AB-TEST001",
    description: "Booking baru dibuat: Futsal A, 25 Jun 2026 08:00-10:00 (Rp 240.000)",
    metadata: '{"court":"Futsal A","date":"2026-06-25","time":"08:00-10:00","price":240000}',
    ip_address: "103.12.45.100", user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  },
  {
    id: "act-010", timestamp: "2026-06-24T08:00:00.000Z", action: "booking_created",
    category: "booking", actor_type: "customer", actor_id: "cust-002", actor_name: "Siti Rahayu",
    target_type: "booking", target_id: "bk-002", target_label: "AB-TEST002",
    description: "Booking baru dibuat: Badminton Court 1, 25 Jun 2026 17:00-19:00 (Rp 160.000)",
    metadata: '{"court":"Badminton Court 1","date":"2026-06-25","time":"17:00-19:00","price":160000}',
    ip_address: "114.122.55.200", user_agent: "Mozilla/5.0 (Android 14; SM-S918B)",
  },
  {
    id: "act-011", timestamp: "2026-06-24T08:30:00.000Z", action: "booking_created",
    category: "booking", actor_type: "customer", actor_id: "cust-003", actor_name: "Andi Wijaya",
    target_type: "booking", target_id: "bk-003", target_label: "AB-TEST003",
    description: "Booking baru dibuat: Padel Court 1, 26 Jun 2026 10:00-12:00 (Rp 300.000)",
    metadata: '{"court":"Padel Court 1","date":"2026-06-26","time":"10:00-12:00","price":300000}',
    ip_address: "36.68.210.50", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },
  {
    id: "act-012", timestamp: "2026-06-24T09:00:00.000Z", action: "booking_created",
    category: "booking", actor_type: "customer", actor_id: "cust-001", actor_name: "Budi Santoso",
    target_type: "booking", target_id: "bk-004", target_label: "AB-TEST004",
    description: "Booking baru dibuat: Minisoccer 1, 27 Jun 2026 15:00-17:00 (Rp 400.000)",
    metadata: '{"court":"Minisoccer 1","date":"2026-06-27","time":"15:00-17:00","price":400000}',
    ip_address: "103.12.45.100", user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  },
  {
    id: "act-013", timestamp: "2026-06-24T09:15:00.000Z", action: "booking_created",
    category: "booking", actor_type: "customer", actor_id: "cust-002", actor_name: "Siti Rahayu",
    target_type: "booking", target_id: "bk-005", target_label: "AB-TEST005",
    description: "Booking baru dibuat: Tenis Court 1, 25 Jun 2026 07:00-09:00 (Rp 200.000)",
    metadata: '{"court":"Tenis Court 1","date":"2026-06-25","time":"07:00-09:00","price":200000}',
    ip_address: "114.122.55.200", user_agent: "Mozilla/5.0 (Android 14; SM-S918B)",
  },
  {
    id: "act-014", timestamp: "2026-06-24T10:00:00.000Z", action: "booking_cancelled",
    category: "booking", actor_type: "customer", actor_id: "cust-002", actor_name: "Siti Rahayu",
    target_type: "booking", target_id: "bk-005", target_label: "AB-TEST005",
    description: "Booking AB-TEST005 dibatalkan oleh customer. Alasan: Batal karena hujan",
    metadata: '{"previous_status":"confirmed","new_status":"cancelled","reason":"Batal karena hujan"}',
    ip_address: "114.122.55.200", user_agent: "Mozilla/5.0 (Android 14; SM-S918B)",
  },

  // === PAYMENT ===
  {
    id: "act-015", timestamp: "2026-06-24T07:35:00.000Z", action: "payment_proof_uploaded",
    category: "payment", actor_type: "customer", actor_id: "cust-001", actor_name: "Budi Santoso",
    target_type: "booking", target_id: "bk-001", target_label: "AB-TEST001",
    description: "Bukti pembayaran diupload untuk booking AB-TEST001",
    metadata: '{"payment_method":"bca_transfer","amount":240000}',
    ip_address: "103.12.45.100", user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  },
  {
    id: "act-016", timestamp: "2026-06-24T08:10:00.000Z", action: "payment_proof_uploaded",
    category: "payment", actor_type: "customer", actor_id: "cust-003", actor_name: "Andi Wijaya",
    target_type: "booking", target_id: "bk-003", target_label: "AB-TEST003",
    description: "Bukti pembayaran diupload untuk booking AB-TEST003",
    metadata: '{"payment_method":"gopay","amount":300000}',
    ip_address: "36.68.210.50", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },

  // === ADMIN - Booking Management ===
  {
    id: "act-017", timestamp: "2026-06-24T09:00:00.000Z", action: "booking_status_changed",
    category: "admin_booking", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "booking", target_id: "bk-001", target_label: "AB-TEST001",
    description: "Status booking AB-TEST001 diubah: pending → confirmed",
    metadata: '{"previous_status":"pending","new_status":"confirmed","reason":"Pembayaran sudah diverifikasi"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-018", timestamp: "2026-06-24T09:05:00.000Z", action: "booking_status_changed",
    category: "admin_booking", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "booking", target_id: "bk-004", target_label: "AB-TEST004",
    description: "Status booking AB-TEST004 diubah: pending → confirmed",
    metadata: '{"previous_status":"pending","new_status":"confirmed","reason":"Pembayaran sudah diverifikasi"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-019", timestamp: "2026-06-24T10:30:00.000Z", action: "payment_confirmed",
    category: "admin_booking", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "booking", target_id: "bk-001", target_label: "AB-TEST001",
    description: "Pembayaran booking AB-TEST001 dikonfirmasi admin",
    metadata: '{"payment_status":"paid","amount":240000}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-020", timestamp: "2026-06-24T10:35:00.000Z", action: "payment_confirmed",
    category: "admin_booking", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "booking", target_id: "bk-004", target_label: "AB-TEST004",
    description: "Pembayaran booking AB-TEST004 dikonfirmasi admin",
    metadata: '{"payment_status":"paid","amount":400000}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },

  // === ADMIN - Court Management ===
  {
    id: "act-021", timestamp: "2026-06-24T05:45:00.000Z", action: "court_created",
    category: "admin_court", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "court", target_id: "court-f1", target_label: "Futsal A",
    description: "Lapangan baru ditambahkan: Futsal A (Arena Sport Center, Sintetis, Rp 150.000/jam)",
    metadata: '{"venue":"Arena Sport Center","sport":"Futsal","surface":"Sintetis","indoor":true,"capacity":10,"base_price":150000}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-022", timestamp: "2026-06-24T05:50:00.000Z", action: "court_created",
    category: "admin_court", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "court", target_id: "court-f2", target_label: "Futsal B",
    description: "Lapangan baru ditambahkan: Futsal B (Arena Sport Center, Vinyl, Rp 120.000/jam)",
    metadata: '{"venue":"Arena Sport Center","sport":"Futsal","surface":"Vinyl","indoor":true,"capacity":10,"base_price":120000}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-023", timestamp: "2026-06-24T06:00:00.000Z", action: "court_updated",
    category: "admin_court", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "court", target_id: "court-b1", target_label: "Badminton Court 1",
    description: "Lapangan diperbarui: Badminton Court 1 - harga dasar diubah",
    metadata: '{"field":"base_price","old_value":"70000","new_value":"80000"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },

  // === ADMIN - Pricing Management ===
  {
    id: "act-024", timestamp: "2026-06-24T06:15:00.000Z", action: "pricing_rule_created",
    category: "admin_pricing", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "pricing_rule", target_id: "pr-f1-weekday", target_label: "Futsal A - Weekday",
    description: "Aturan harga dibuat: Futsal A weekday 06:00-17:00 = Rp 120.000/jam",
    metadata: '{"court":"Futsal A","day_type":"weekday","time":"06:00-17:00","price":120000}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-025", timestamp: "2026-06-24T06:20:00.000Z", action: "pricing_rule_updated",
    category: "admin_pricing", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "pricing_rule", target_id: "pr-f1-peak", target_label: "Futsal A - Peak",
    description: "Aturan harga diperbarui: Futsal A peak hours weekday",
    metadata: '{"old_price":140000,"new_price":150000,"time":"17:00-23:00"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },

  // === ADMIN - Blocked Slots ===
  {
    id: "act-026", timestamp: "2026-06-24T11:00:00.000Z", action: "blocked_slot_created",
    category: "admin_court", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "blocked_slot", target_id: "bs-001", target_label: "Futsal A - 28 Jun 2026",
    description: "Slot diblokir: Futsal A, 28 Jun 2026 10:00-12:00 (Maintenance lapangan)",
    metadata: '{"court_id":"court-f1","date":"2026-06-28","time":"10:00-12:00","reason":"Maintenance lapangan"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-027", timestamp: "2026-06-24T11:10:00.000Z", action: "blocked_slot_created",
    category: "admin_court", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "blocked_slot", target_id: "bs-002", target_label: "Badminton Court 1 - 29 Jun 2026",
    description: "Slot diblokir: Badminton Court 1, 29 Jun 2026 14:00-16:00 (Event internal)",
    metadata: '{"court_id":"court-b1","date":"2026-06-29","time":"14:00-16:00","reason":"Event internal"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },

  // === ADMIN - Payment Methods ===
  {
    id: "act-028", timestamp: "2026-06-24T05:40:00.000Z", action: "payment_method_created",
    category: "admin_settings", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "payment_method", target_id: "pm-bca", target_label: "BCA Transfer",
    description: "Metode pembayaran ditambahkan: Transfer BCA (1234567890 a.n PT Lapangin Indonesia)",
    metadata: '{"type":"bank_transfer","provider":"BCA","account_number":"1234567890"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-029", timestamp: "2026-06-24T05:42:00.000Z", action: "payment_method_created",
    category: "admin_settings", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "payment_method", target_id: "pm-gopay", target_label: "GoPay",
    description: "Metode pembayaran ditambahkan: GoPay (081234567890 a.n Lapangin)",
    metadata: '{"type":"ewallet","provider":"GoPay","account_number":"081234567890"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },

  // === NOTIFICATIONS ===
  {
    id: "act-030", timestamp: "2026-06-24T09:02:00.000Z", action: "notification_sent",
    category: "notification", actor_type: "system", actor_id: "", actor_name: "System",
    target_type: "booking", target_id: "bk-001", target_label: "AB-TEST001",
    description: "Notifikasi WhatsApp terkirim ke Budi Santoso: Booking AB-TEST001 dikonfirmasi",
    metadata: '{"channel":"whatsapp","recipient":"081234567890","type":"booking_confirmed","status":"sent"}',
    ip_address: "", user_agent: "Server-Side",
  },
  {
    id: "act-031", timestamp: "2026-06-24T08:02:00.000Z", action: "notification_sent",
    category: "notification", actor_type: "system", actor_id: "", actor_name: "System",
    target_type: "booking", target_id: "bk-002", target_label: "AB-TEST002",
    description: "Notifikasi WhatsApp terkirim ke Siti Rahayu: Booking AB-TEST002 berhasil dibuat",
    metadata: '{"channel":"whatsapp","recipient":"081298765432","type":"booking_created","status":"sent"}',
    ip_address: "", user_agent: "Server-Side",
  },
  {
    id: "act-032", timestamp: "2026-06-24T10:05:00.000Z", action: "notification_failed",
    category: "notification", actor_type: "system", actor_id: "", actor_name: "System",
    target_type: "booking", target_id: "bk-005", target_label: "AB-TEST005",
    description: "Notifikasi WhatsApp gagal terkirim ke Siti Rahayu: Nomor tidak aktif",
    metadata: '{"channel":"whatsapp","recipient":"081678901234","type":"booking_cancelled","status":"failed","error":"Nomor tidak aktif"}',
    ip_address: "", user_agent: "Server-Side",
  },

  // === LOYALTY ===
  {
    id: "act-033", timestamp: "2026-06-24T09:02:00.000Z", action: "loyalty_points_earned",
    category: "loyalty", actor_type: "system", actor_id: "", actor_name: "System",
    target_type: "customer", target_id: "cust-001", target_label: "Budi Santoso",
    description: "Budi Santoso mendapat 50 poin loyalty dari booking AB-TEST001 (Rp 240.000)",
    metadata: '{"points":50,"total_points":150,"booking_id":"bk-001","earned_from":"booking"}',
    ip_address: "", user_agent: "Server-Side",
  },
  {
    id: "act-034", timestamp: "2026-06-24T06:10:00.000Z", action: "loyalty_points_earned",
    category: "loyalty", actor_type: "system", actor_id: "", actor_name: "System",
    target_type: "customer", target_id: "cust-001", target_label: "Budi Santoso",
    description: "Budi Santoso mendapat 100 poin bonus pendaftaran",
    metadata: '{"points":100,"total_points":100,"booking_id":"","earned_from":"registration_bonus"}',
    ip_address: "", user_agent: "Server-Side",
  },
  {
    id: "act-035", timestamp: "2026-06-25T08:00:00.000Z", action: "reward_redeemed",
    category: "loyalty", actor_type: "customer", actor_id: "cust-001", actor_name: "Budi Santoso",
    target_type: "reward", target_id: "reward-001", target_label: "Diskon 10%",
    description: "Budi Santoso menukarkan 100 poin untuk Diskon 10%",
    metadata: '{"points_used":100,"remaining_points":50,"discount_type":"percentage","discount_value":10}',
    ip_address: "103.12.45.100", user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  },

  // === ADMIN - Notification Management ===
  {
    id: "act-036", timestamp: "2026-06-24T12:00:00.000Z", action: "notification_resent",
    category: "admin_notification", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "notification", target_id: "notif-002", target_label: "AB-TEST002 - WhatsApp",
    description: "Admin mengirim ulang notifikasi WhatsApp untuk booking AB-TEST002",
    metadata: '{"original_notif_id":"notif-002","channel":"whatsapp","recipient":"081298765432"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },

  // === BOOKING - Availability Check ===
  {
    id: "act-037", timestamp: "2026-06-24T07:25:00.000Z", action: "availability_checked",
    category: "booking", actor_type: "customer", actor_id: "cust-001", actor_name: "Budi Santoso",
    target_type: "court", target_id: "court-f1", target_label: "Futsal A",
    description: "Ketersediaan slot dicek: Futsal A, 25 Jun 2026",
    metadata: '{"date":"2026-06-25","available_slots":12,"booked_slots":2}',
    ip_address: "103.12.45.100", user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)",
  },
  {
    id: "act-038", timestamp: "2026-06-24T07:55:00.000Z", action: "availability_checked",
    category: "booking", actor_type: "customer", actor_id: "cust-002", actor_name: "Siti Rahayu",
    target_type: "court", target_id: "court-b1", target_label: "Badminton Court 1",
    description: "Ketersediaan slot dicek: Badminton Court 1, 25 Jun 2026",
    metadata: '{"date":"2026-06-25","available_slots":10,"booked_slots":1}',
    ip_address: "114.122.55.200", user_agent: "Mozilla/5.0 (Android 14; SM-S918B)",
  },

  // === ADMIN - Settings ===
  {
    id: "act-039", timestamp: "2026-06-24T05:35:00.000Z", action: "settings_updated",
    category: "admin_settings", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "settings", target_id: "", target_label: "App Settings",
    description: "Pengaturan aplikasi diperbarui: nama aplikasi, jam operasional",
    metadata: '{"fields_updated":["app_name","open_time","close_time"],"app_name":"Lapangin"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },

  // === BOOKING - Double Booking Prevention ===
  {
    id: "act-040", timestamp: "2026-06-24T08:15:00.000Z", action: "booking_rejected_conflict",
    category: "booking", actor_type: "customer", actor_id: "cust-003", actor_name: "Andi Wijaya",
    target_type: "booking", target_id: "", target_label: "Futsal A - 25 Jun 08:00-10:00",
    description: "Booking ditolak: Slot Futsal A sudah dibooking (double booking prevention)",
    metadata: '{"court_id":"court-f1","date":"2026-06-25","time":"08:00-10:00","conflict_booking":"bk-001","reason":"slot_taken"}',
    ip_address: "36.68.210.50", user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  },

  // === BOOKING - Booking Completed ===
  {
    id: "act-041", timestamp: "2026-06-25T10:00:00.000Z", action: "booking_completed",
    category: "booking", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "booking", target_id: "bk-001", target_label: "AB-TEST001",
    description: "Booking AB-TEST001 ditandai selesai: Futsal A, 25 Jun 2026 08:00-10:00",
    metadata: '{"previous_status":"confirmed","new_status":"completed"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-042", timestamp: "2026-06-25T10:02:00.000Z", action: "loyalty_points_earned",
    category: "loyalty", actor_type: "system", actor_id: "", actor_name: "System",
    target_type: "customer", target_id: "cust-001", target_label: "Budi Santoso",
    description: "Budi Santoso mendapat 24 poin loyalty dari booking AB-TEST001 yang selesai (Rp 240.000)",
    metadata: '{"points":24,"total_points":74,"booking_id":"bk-001","earned_from":"booking_completed"}',
    ip_address: "", user_agent: "Server-Side",
  },

  // === BOOKING - No Show ===
  {
    id: "act-043", timestamp: "2026-06-26T12:00:00.000Z", action: "booking_no_show",
    category: "booking", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "booking", target_id: "bk-004", target_label: "AB-TEST004",
    description: "Booking AB-TEST004 ditandai no show: Minisoccer 1, 27 Jun 2026 15:00-17:00",
    metadata: '{"previous_status":"confirmed","new_status":"no_show"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },

  // === ADMIN - Venue Management ===
  {
    id: "act-044", timestamp: "2026-06-24T05:32:00.000Z", action: "venue_created",
    category: "admin_venue", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "venue", target_id: "venue-arena1", target_label: "Arena Sport Center",
    description: "Venue baru ditambahkan: Arena Sport Center, Jl. Sudirman No. 123, Jakarta Selatan",
    metadata: '{"address":"Jl. Sudirman No. 123, Jakarta Selatan","phone":"081234567890","open_time":"06:00","close_time":"23:00"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "act-045", timestamp: "2026-06-24T05:33:00.000Z", action: "venue_created",
    category: "admin_venue", actor_type: "admin", actor_id: "admin-1", actor_name: "Admin Lapangin",
    target_type: "venue", target_id: "venue-greenfield", target_label: "Greenfield Arena",
    description: "Venue baru ditambahkan: Greenfield Arena, Jl. Gatot Subroto No. 45, Jakarta Pusat",
    metadata: '{"address":"Jl. Gatot Subroto No. 45, Jakarta Pusat","phone":"081298765432","open_time":"07:00","close_time":"22:00"}',
    ip_address: "202.150.10.5", user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
];

const SEED_DATA: Record<string, Record<string, string>[]> = {
  activity_logs: SEED_ACTIVITY_LOGS,
  sports: SEED_SPORTS,
  areas: SEED_AREAS,
  venue_owners: SEED_VENUE_OWNERS,
  venues: SEED_VENUES,
  courts: SEED_COURTS,
  pricing_rules: SEED_PRICING_RULES,
  bookings: SEED_BOOKINGS,
  blocked_slots: SEED_BLOCKED_SLOTS,
  audit_log: SEED_AUDIT_LOG,
  payment_methods: SEED_PAYMENT_METHODS,
  notification_logs: SEED_NOTIFICATION_LOGS,
  admin_users: SEED_ADMIN_USERS,
  customers: SEED_CUSTOMERS,
  loyalty_transactions: SEED_LOYALTY_TRANSACTIONS,
  rewards: SEED_REWARDS,
  reward_redemptions: SEED_REWARD_REDEMPTIONS,
};

// ── Main ──

async function main() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!spreadsheetId || !clientEmail || !privateKey) {
    console.error("❌ Missing env vars. Ensure GOOGLE_SHEETS_SPREADSHEET_ID, GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY are set in .env.local");
    process.exit(1);
  }

  console.log("🔑 Authenticating with Google...");
  const jwtClient = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(spreadsheetId, jwtClient);
  await doc.loadInfo();
  console.log(`📄 Spreadsheet loaded: "${doc.title}"`);

  // Create all sheets
  for (const [sheetName, headers] of Object.entries(SHEET_DEFINITIONS)) {
    let sheet = doc.sheetsByTitle[sheetName];

    if (!sheet) {
      console.log(`  📝 Creating sheet: "${sheetName}"...`);
      sheet = await doc.addSheet({
        title: sheetName,
        headerValues: headers,
      });
    } else {
      console.log(`  ✅ Sheet "${sheetName}" already exists.`);
      // Ensure headers are correct
      await sheet.loadHeaderRow();
      const existingHeaders = sheet.headerValues;
      const missingHeaders = headers.filter((h) => !existingHeaders.includes(h));
      if (missingHeaders.length > 0) {
        console.log(`    ⚠️  Adding missing headers: ${missingHeaders.join(", ")}`);
        const allHeaders = [...existingHeaders, ...missingHeaders];
        await sheet.setHeaderRow(allHeaders);
      }
    }
  }

  // Seed data
  console.log("\n🌱 Seeding data...");
  for (const [sheetName, rows] of Object.entries(SEED_DATA)) {
    if (rows.length === 0) {
      console.log(`  ⏭️  Skipping "${sheetName}" (no seed data).`);
      continue;
    }

    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) {
      console.error(`  ❌ Sheet "${sheetName}" not found!`);
      continue;
    }

    // Check if sheet already has data
    await sheet.loadHeaderRow();
    const existingRows = await sheet.getRows();
    if (existingRows.length > 0) {
      console.log(`  ⏭️  Sheet "${sheetName}" already has ${existingRows.length} rows, skipping seed.`);
      continue;
    }

    console.log(`  🌱 Seeding ${rows.length} rows into "${sheetName}"...`);
    await sheet.addRows(rows);
  }

  console.log("\n✅ Spreadsheet generation complete!");
  console.log(`🔗 Open: https://docs.google.com/spreadsheets/d/${spreadsheetId}`);
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});