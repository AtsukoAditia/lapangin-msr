-- ==========================================================
-- Lapangin — Supabase Demo Seed Data
-- Synced with supabase/schema.sql
-- Idempotent via ON CONFLICT DO NOTHING.
-- ==========================================================

-- ==================== AREAS ====================
INSERT INTO areas (id, province, city, district, slug, label, is_active, created_at, updated_at) VALUES
  ('area-bdg-kota',    'Jawa Barat',  'Bandung',        'Kota Bandung',        'bandung-kota',        'Bandung Kota',        true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('area-bdg-kab',     'Jawa Barat',  'Bandung',        'Kabupaten Bandung',   'bandung-kabupaten',   'Bandung Kabupaten',   true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('area-jkt-selatan', 'DKI Jakarta', 'Jakarta Selatan', 'Jakarta Selatan',    'jakarta-selatan',     'Jakarta Selatan',     true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('area-sby-kota',    'Jawa Timur',  'Surabaya',       'Kota Surabaya',       'surabaya-kota',       'Surabaya Kota',       true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('area-yog-kota',    'DI Yogyakarta','Yogyakarta',    'Kota Yogyakarta',     'yogyakarta-kota',     'Yogyakarta Kota',     true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('area-smg-kota',    'Jawa Tengah', 'Semarang',       'Kota Semarang',       'semarang-kota',       'Semarang Kota',       true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('area-mdn-kota',    'Sumatera Utara','Medan',         'Kota Medan',          'medan-kota',          'Medan Kota',          true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('area-blp-kota',    'Bali',        'Denpasar',       'Kota Denpasar',       'denpasar-kota',       'Denpasar Kota',       true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==================== ADMINS ====================
INSERT INTO admins (id, username, name, email, password_hash, role, is_active, created_at, last_login_at) VALUES
  ('admin-1', 'admin',      'Super Admin',   'admin@lapangin.id',  '$2b$10$PogPeENNeY9.gNDNbMg9mOAKWgPwExS8.o54sE/BHFH2LkTMNlzGy', 'super_admin', true, '2026-06-25T00:00:00Z', NULL),
  ('owner-1', 'venueowner', 'Venue Owner',   'owner@lapangin.id',  '$2b$10$8RkQCFdl7l/aC3czGPRGeOrx1CXhkl/ZJUCmS5p3AUVynuOuVdeyC', 'admin',       true, '2026-06-25T00:00:00Z', NULL)
ON CONFLICT (id) DO NOTHING;

-- ==================== VENUE OWNERS ====================
INSERT INTO venue_owners (id, admin_id, business_name, pic_name, phone, email, status, created_at, updated_at) VALUES
  ('owner-greenfield', 'owner-1',  'Greenfield Sports Club', 'Andi Wijaya',   '081234567890', 'andi@greenfield.id',    'active', '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('owner-rahasian',   NULL,       'Rahasia Badminton Arena','Budi Santoso',  '082345678901', 'budi@rahasian.id',      'active', '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('owner-arena-futsal', NULL,     'Arena Futsal Bandung',   'Charlie Putra', '083456789012', 'charlie@arenafutsal.id','active', '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==================== SPORTS ====================
INSERT INTO sports (id, name, slug, is_active, created_at, updated_at) VALUES
  ('sport-futsal',      'Futsal',       'futsal',       true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('sport-bulu-tangkis','Bulu Tangkis', 'bulu-tangkis', true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('sport-mini-soccer', 'Mini Soccer',  'mini-soccer',   true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('sport-padel',       'Padel',        'padel',        true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('sport-tenis',       'Tenis',        'tenis',        true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('sport-basket',      'Basket',       'basket',       true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==================== VENUES ====================
INSERT INTO venues (id, name, slug, owner_id, area_id, address, description, maps_url, phone, facilities, open_time, close_time, approval_status, is_active, created_at, updated_at) VALUES
  ('venue-greenfield', 'Greenfield Sports Club', 'greenfield-sports-club',
   'owner-greenfield', 'area-bdg-kota',
   'Jl. Golf No. 10, Bandung', 'Venue olahraga lengkap di pusat kota Bandung.', '', '022-1234567',
   '["Parkir","Toilet","Kantin","Ruang Ganti","WiFi"]'::jsonb,
   '06:00', '23:00', 'active', true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('venue-rahasian', 'Rahasia Badminton Arena', 'rahasian-badminton',
   'owner-rahasian', 'area-jkt-selatan',
   'Jl. Kemang Raya No. 25, Jakarta Selatan', 'Arena badminton premium ber-AC dengan 8 lapangan.', '', '021-9876543',
   '["Parkir","Toilet","Kantin","Ruang Ganti","WiFi","AC"]'::jsonb,
   '07:00', '22:00', 'active', true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('venue-arena-futsal', 'Arena Futsal Bandung', 'arena-futsal-bandung',
   'owner-arena-futsal', 'area-bdg-kota',
   'Jl. Setiabudhi No. 50, Bandung', 'Lapangan futsal standar FIFA dengan rumput sintetis.', '', '022-5551234',
   '["Parkir","Toilet","Kantin","Ruang Ganti"]'::jsonb,
   '06:00', '23:00', 'active', true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==================== COURTS ====================
INSERT INTO courts (id, venue_id, sport_id, name, slug, surface_type, indoor_type, capacity, base_price, is_active, created_at, updated_at) VALUES
  ('court-f1',  'venue-greenfield', 'sport-futsal',       'Futsal Court 1',       'futsal-1',       'Synthetic',        'indoor',      10, 150000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-f2',  'venue-greenfield', 'sport-futsal',       'Futsal Court 2',       'futsal-2',       'Synthetic',        'indoor',      10, 120000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-b1',  'venue-greenfield', 'sport-bulu-tangkis', 'Badminton Court 1',    'badminton-1',    'Synthetic',        'indoor',       4,  80000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-b2',  'venue-greenfield', 'sport-bulu-tangkis', 'Badminton Court 2',    'badminton-2',    'Synthetic',        'indoor',       4,  80000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-b3',  'venue-greenfield', 'sport-bulu-tangkis', 'Badminton Court 3',    'badminton-3',    'Synthetic',        'indoor',       4,  80000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-p1',  'venue-greenfield', 'sport-padel',        'Padel Court 1',        'padel-1',        'Artificial Grass', 'outdoor',      4, 150000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-ms1', 'venue-greenfield', 'sport-mini-soccer',  'Mini Soccer Field 1',  'mini-soccer-1',  'Artificial Grass', 'outdoor',      4, 150000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-t1',  'venue-greenfield', 'sport-tenis',        'Tenis Court 1',        'tenis-1',        'Hard Court',       'outdoor',      4, 100000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-bsk1','venue-greenfield', 'sport-basket',       'Basket Court 1',       'basket-1',       'Hard Court',       'outdoor',     10, 100000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-b4',  'venue-rahasian',   'sport-bulu-tangkis', 'Badminton Court 1',    'badminton-1',    'Synthetic',        'indoor',       4,  90000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-b5',  'venue-rahasian',   'sport-bulu-tangkis', 'Badminton Court 2',    'badminton-2',    'Synthetic',        'indoor',       4,  90000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-b6',  'venue-rahasian',   'sport-bulu-tangkis', 'Badminton Court 3',    'badminton-3',    'Synthetic',        'indoor',       4,  85000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-b7',  'venue-rahasian',   'sport-bulu-tangkis', 'Badminton Court 4',    'badminton-4',    'Synthetic',        'indoor',       4,  85000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-f3',  'venue-arena-futsal','sport-futsal',      'Futsal Court 1',       'futsal-1',       'Synthetic',        'indoor',      10, 130000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-f4',  'venue-arena-futsal','sport-futsal',      'Futsal Court 2',       'futsal-2',       'Synthetic',        'indoor',      10, 130000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('court-f5',  'venue-arena-futsal','sport-futsal',      'Futsal Court 3',       'futsal-3',       'Synthetic',        'indoor',      10, 110000, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==================== PRICING RULES ====================
INSERT INTO pricing_rules (id, court_id, day_type, start_time, end_time, price_per_hour, priority, is_active, created_at, updated_at) VALUES
  ('pr-f1-weekday', 'court-f1', 'weekday', '06:00', '17:00', 120000, 1, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-f1-peak',    'court-f1', 'weekday', '17:00', '23:00', 150000, 2, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-f1-weekend', 'court-f1', 'weekend', '06:00', '23:00', 180000, 3, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-f2-weekday', 'court-f2', 'weekday', '06:00', '17:00', 100000, 1, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-f2-peak',    'court-f2', 'weekday', '17:00', '23:00', 120000, 2, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-f2-weekend', 'court-f2', 'weekend', '06:00', '23:00', 150000, 3, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-b1-weekday', 'court-b1', 'weekday', '06:00', '17:00',  65000, 1, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-b1-peak',    'court-b1', 'weekday', '17:00', '23:00',  80000, 2, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-b1-weekend', 'court-b1', 'weekend', '06:00', '23:00',  90000, 3, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-b4-weekday', 'court-b4', 'weekday', '06:00', '17:00',  75000, 1, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-b4-peak',    'court-b4', 'weekday', '17:00', '22:00',  90000, 2, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pr-b4-weekend', 'court-b4', 'weekend', '06:00', '22:00', 100000, 3, true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==================== CUSTOMERS ====================
INSERT INTO customers (id, name, email, phone, password_hash, is_verified, is_active, loyalty_points, total_spent, member_since, created_at, updated_at) VALUES
  ('customer-1', 'John Doe',    'john@example.com',   '081234567890', '$2b$10$PogPeENNeY9.gNDNbMg9mOAKWgPwExS8.o54sE/BHFH2LkTMNlzGy', true, true, 100, 300000, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('customer-2', 'Jane Smith',  'jane@example.com',   '082345678901', '$2b$10$PogPeENNeY9.gNDNbMg9mOAKWgPwExS8.o54sE/BHFH2LkTMNlzGy', true, true, 50,  150000, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==================== BOOKINGS (demo) ====================
INSERT INTO bookings (id, booking_code, customer_name, customer_phone, customer_email, user_id, venue_id, court_id, sport_id, booking_date, start_time, end_time, duration_minutes, total_price, booking_status, payment_status, notes, expires_at, payment_submitted_at, payment_verified_at, verified_by_admin_id, created_at, updated_at) VALUES
  ('booking-001', 'BK-260624-DEMO1', 'John Doe',    '081234567890', 'john@example.com',   'customer-1', 'venue-greenfield', 'court-f1', 'sport-futsal',      '2026-07-01', '19:00', '21:00', 120, 300000, 'confirmed',          'paid',                'Demo confirmed booking',        NULL,              NULL,              '2026-06-25T10:00:00Z', 'admin-1', '2026-06-25T08:00:00Z', '2026-06-25T10:00:00Z'),
  ('booking-002', 'BK-260624-DEMO2', 'Jane Smith',  '082345678901', 'jane@example.com',   'customer-2', 'venue-greenfield', 'court-f1', 'sport-futsal',      '2026-07-01', '21:00', '22:00',  60, 150000, 'waiting_verification','waiting_confirmation','Demo waiting for verification', NULL,              '2026-06-25T09:10:00Z', NULL,                   NULL,      '2026-06-25T08:30:00Z', '2026-06-25T09:10:00Z'),
  ('booking-003', 'BK-260624-DEMO3', 'Bob Wilson',  '083456789012', 'bob@example.com',    NULL,         'venue-greenfield', 'court-f1', 'sport-futsal',      '2026-07-02', '17:00', '19:00', 120, 300000, 'waiting_payment',    'unpaid',              'Demo waiting payment (active)',  '2026-12-31T23:59:00Z', NULL, NULL,                   NULL,      '2026-06-25T09:45:00Z', '2026-06-25T09:45:00Z'),
  ('booking-004', 'BK-260624-DEMO4', 'Alice Brown', '084567890123', 'alice@example.com',  NULL,         'venue-greenfield', 'court-f1', 'sport-futsal',      '2026-07-02', '19:00', '20:00',  60, 150000, 'expired',            'unpaid',              'Demo expired booking',           '2026-06-25T08:00:00Z', NULL, NULL,                   NULL,      '2026-06-25T07:45:00Z', '2026-06-25T08:00:00Z'),
  ('booking-005', 'BK-260624-DEMO5', 'Charlie D.',  '085678901234', 'charlie@example.com', NULL,        'venue-rahasian',   'court-b4', 'sport-bulu-tangkis','2026-07-01', '20:00', '21:00',  60,  90000, 'confirmed',          'paid',                'Demo confirmed badminton',       NULL,              NULL,              '2026-06-25T11:00:00Z', 'admin-1', '2026-06-25T10:30:00Z', '2026-06-25T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ==================== PAYMENT METHODS ====================
INSERT INTO payment_methods (id, name, label, type, account_name, account_number, provider, details, instructions, is_active, created_at, updated_at) VALUES
  ('pm-1', 'BCA Transfer',    'BCA Transfer',    'bank_transfer', 'PT Lapangin Indonesia', '1234567890', 'BCA',    '', 'Transfer ke rekening BCA atas nama PT Lapangin Indonesia. Setelah transfer, kirim bukti pembayaran.', true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pm-2', 'Mandiri Transfer','Mandiri Transfer', 'bank_transfer', 'PT Lapangin Indonesia', '0987654321', 'Mandiri','', 'Transfer ke rekening Mandiri atas nama PT Lapangin Indonesia. Setelah transfer, kirim bukti pembayaran.', true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z'),
  ('pm-3', 'QRIS',            'QRIS',            'qris',          'PT Lapangin Indonesia', 'QRIS-LAPANGIN', '',    '', 'Scan QR code yang diberikan. Setelah transfer, kirim bukti pembayaran.',                             true, '2026-06-25T00:00:00Z', '2026-06-25T00:00:00Z')
ON CONFLICT (id) DO NOTHING;