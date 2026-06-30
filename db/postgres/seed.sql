-- ==========================================================
-- Lapangin MSR — PostgreSQL Demo Seed Data
-- Generated: 2026-06-25
-- Idempotent via ON CONFLICT DO NOTHING.
-- ==========================================================

-- ==================== AREAS ====================
INSERT INTO areas (id, province, city, district, slug, is_active, created_at, updated_at) VALUES
  ('area-bdg-kota',    'Jawa Barat',  'Bandung',        'Kota Bandung',        'bandung-kota',        true, NOW(), NOW()),
  ('area-bdg-kab',     'Jawa Barat',  'Bandung',        'Kabupaten Bandung',   'bandung-kabupaten',   true, NOW(), NOW()),
  ('area-jkt-selatan', 'DKI Jakarta', 'Jakarta Selatan', 'Jakarta Selatan',    'jakarta-selatan',     true, NOW(), NOW()),
  ('area-sby-kota',    'Jawa Timur',  'Surabaya',       'Kota Surabaya',       'surabaya-kota',       true, NOW(), NOW()),
  ('area-yog-kota',    'DI Yogyakarta','Yogyakarta',    'Kota Yogyakarta',     'yogyakarta-kota',     true, NOW(), NOW()),
  ('area-smg-kota',    'Jawa Tengah', 'Semarang',       'Kota Semarang',       'semarang-kota',       true, NOW(), NOW()),
  ('area-mdn-kota',    'Sumatera Utara','Medan',         'Kota Medan',          'medan-kota',          true, NOW(), NOW()),
  ('area-blp-kota',    'Bali',        'Denpasar',       'Kota Denpasar',       'denpasar-kota',       true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== VENUE OWNERS ====================
INSERT INTO venue_owners (id, user_id, business_name, pic_name, phone, email, status, created_at, updated_at) VALUES
  ('owner-greenfield', 'owner-1',  'Greenfield Sports Club', 'Andi Wijaya',   '081234567890', 'andi@greenfield.id',  'active', NOW(), NOW()),
  ('owner-rahasian',   NULL,       'Rahasia Badminton Arena','Budi Santoso',  '082345678901', 'budi@rahasian.id',    'active', NOW(), NOW()),
  ('owner-arena-futsal', NULL,     'Arena Futsal Bandung',   'Charlie Putra', '083456789012', 'charlie@arenafutsal.id','active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== SPORTS ====================
INSERT INTO sports (id, name, slug, icon, is_active, created_at, updated_at) VALUES
  ('sport-futsal',    'Futsal',      'futsal',    '⚽',  true, NOW(), NOW()),
  ('sport-bulu-tangkis','Bulu Tangkis','bulu-tangkis','🏸', true, NOW(), NOW()),
  ('sport-mini-soccer','Mini Soccer', 'mini-soccer','⚽',  true, NOW(), NOW()),
  ('sport-padel',     'Padel',       'padel',     '🎾',  true, NOW(), NOW()),
  ('sport-tenis',     'Tenis',       'tenis',     '🎾',  true, NOW(), NOW()),
  ('sport-basket',    'Basket',      'basket',    '🏀',  true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== VENUES ====================
INSERT INTO venues (id, owner_id, area_id, name, slug, address, phone, email, description, operating_hours_start, operating_hours_end, facilities, images, is_active, approval_status, created_at, updated_at) VALUES
  ('venue-greenfield', 'owner-greenfield', 'area-bdg-kota',
   'Greenfield Sports Club', 'greenfield-sports-club',
   'Jl. Golf No. 10, Bandung', '022-1234567', 'info@greenfield.id',
   'Venue olahraga lengkap di pusat kota Bandung.',
   '06:00', '23:00',
   '["Parkir","Toilet","Kantin","Ruang Ganti","WiFi"]'::jsonb,
   NULL, true, 'active', NOW(), NOW()),
  ('venue-rahasian', 'owner-rahasian', 'area-jkt-selatan',
   'Rahasia Badminton Arena', 'rahasian-badminton',
   'Jl. Kemang Raya No. 25, Jakarta Selatan', '021-9876543', 'info@rahasian.id',
   'Arena badminton premium ber-AC dengan 8 lapangan.',
   '07:00', '22:00',
   '["Parkir","Toilet","Kantin","Ruang Ganti","WiFi","AC"]'::jsonb,
   NULL, true, 'active', NOW(), NOW()),
  ('venue-arena-futsal', 'owner-arena-futsal', 'area-bdg-kota',
   'Arena Futsal Bandung', 'arena-futsal-bandung',
   'Jl. Setiabudhi No. 50, Bandung', '022-5551234', 'info@arenafutsal.id',
   'Lapangan futsal standar FIFA dengan rumput sintetis.',
   '06:00', '23:00',
   '["Parkir","Toilet","Kantin","Ruang Ganti"]'::jsonb,
   NULL, true, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== COURTS ====================
INSERT INTO courts (id, venue_id, sport_id, name, slug, surface_type, indoor_type, capacity, base_price, is_active, created_at, updated_at) VALUES
  -- Greenfield Sports Club
  ('court-f1',  'venue-greenfield', 'sport-futsal',      'Futsal Court 1',       'futsal-1',  'Synthetic',       'indoor',  10, 150000, true, NOW(), NOW()),
  ('court-f2',  'venue-greenfield', 'sport-futsal',      'Futsal Court 2',       'futsal-2',  'Synthetic',       'indoor',  10, 120000, true, NOW(), NOW()),
  ('court-b1',  'venue-greenfield', 'sport-bulu-tangkis','Badminton Court 1',    'badminton-1','Synthetic',       'indoor',  4,  80000,  true, NOW(), NOW()),
  ('court-b2',  'venue-greenfield', 'sport-bulu-tangkis','Badminton Court 2',    'badminton-2','Synthetic',       'indoor',  4,  80000,  true, NOW(), NOW()),
  ('court-b3',  'venue-greenfield', 'sport-bulu-tangkis','Badminton Court 3',    'badminton-3','Synthetic',       'indoor',  4,  80000,  true, NOW(), NOW()),
  ('court-p1',  'venue-greenfield', 'sport-padel',       'Padel Court 1',        'padel-1',   'Artificial Grass', 'outdoor', 4,  150000, true, NOW(), NOW()),
  ('court-ms1', 'venue-greenfield', 'sport-mini-soccer', 'Mini Soccer Field 1',  'mini-soccer-1','Artificial Grass','outdoor', 4,  150000, true, NOW(), NOW()),
  ('court-t1',  'venue-greenfield', 'sport-tenis',       'Tenis Court 1',        'tenis-1',   'Hard Court',       'outdoor', 4,  100000, true, NOW(), NOW()),
  ('court-bsk1','venue-greenfield', 'sport-basket',      'Basket Court 1',       'basket-1',  'Hard Court',       'outdoor', 10, 100000, true, NOW(), NOW()),
  -- Rahasia Badminton Arena
  ('court-b4',  'venue-rahasian',   'sport-bulu-tangkis','Badminton Court 1',    'badminton-1','Synthetic',       'indoor',  4,  90000,  true, NOW(), NOW()),
  ('court-b5',  'venue-rahasian',   'sport-bulu-tangkis','Badminton Court 2',    'badminton-2','Synthetic',       'indoor',  4,  90000,  true, NOW(), NOW()),
  ('court-b6',  'venue-rahasian',   'sport-bulu-tangkis','Badminton Court 3',    'badminton-3','Synthetic',       'indoor',  4,  85000,  true, NOW(), NOW()),
  ('court-b7',  'venue-rahasian',   'sport-bulu-tangkis','Badminton Court 4',    'badminton-4','Synthetic',       'indoor',  4,  85000,  true, NOW(), NOW()),
  -- Arena Futsal Bandung
  ('court-f3',  'venue-arena-futsal','sport-futsal',     'Futsal Court 1',       'futsal-1',  'Synthetic',       'indoor',  10, 130000, true, NOW(), NOW()),
  ('court-f4',  'venue-arena-futsal','sport-futsal',     'Futsal Court 2',       'futsal-2',  'Synthetic',       'indoor',  10, 130000, true, NOW(), NOW()),
  ('court-f5',  'venue-arena-futsal','sport-futsal',     'Futsal Court 3',       'futsal-3',  'Synthetic',       'indoor',  10, 110000, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== PRICING RULES ====================
INSERT INTO pricing_rules (id, court_id, day_type, start_time, end_time, price_per_hour, priority, is_active, created_at, updated_at) VALUES
  -- court-f1
  ('pr-f1-weekday', 'court-f1', 'weekday', '06:00', '17:00', 120000, 1, true, NOW(), NOW()),
  ('pr-f1-peak',    'court-f1', 'weekday', '17:00', '23:00', 150000, 2, true, NOW(), NOW()),
  ('pr-f1-weekend', 'court-f1', 'weekend', '06:00', '23:00', 180000, 3, true, NOW(), NOW()),
  -- court-f2
  ('pr-f2-weekday', 'court-f2', 'weekday', '06:00', '17:00', 100000, 1, true, NOW(), NOW()),
  ('pr-f2-peak',    'court-f2', 'weekday', '17:00', '23:00', 120000, 2, true, NOW(), NOW()),
  ('pr-f2-weekend', 'court-f2', 'weekend', '06:00', '23:00', 150000, 3, true, NOW(), NOW()),
  -- court-b1
  ('pr-b1-weekday', 'court-b1', 'weekday', '06:00', '17:00', 65000, 1, true, NOW(), NOW()),
  ('pr-b1-peak',    'court-b1', 'weekday', '17:00', '23:00', 80000, 2, true, NOW(), NOW()),
  ('pr-b1-weekend', 'court-b1', 'weekend', '06:00', '23:00', 90000, 3, true, NOW(), NOW()),
  -- court-b4 (rahasian)
  ('pr-b4-weekday', 'court-b4', 'weekday', '06:00', '17:00', 75000, 1, true, NOW(), NOW()),
  ('pr-b4-peak',    'court-b4', 'weekday', '17:00', '22:00', 90000, 2, true, NOW(), NOW()),
  ('pr-b4-weekend', 'court-b4', 'weekend', '06:00', '22:00', 100000, 3, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== OPERATING HOURS ====================
INSERT INTO operating_hours (id, court_id, day_of_week, open_time, close_time, is_active, created_at, updated_at) VALUES
  -- court-f1
  ('oh-f1-0', 'court-f1', 0, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f1-1', 'court-f1', 1, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f1-2', 'court-f1', 2, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f1-3', 'court-f1', 3, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f1-4', 'court-f1', 4, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f1-5', 'court-f1', 5, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f1-6', 'court-f1', 6, '06:00', '23:00', true, NOW(), NOW()),
  -- court-f2
  ('oh-f2-0', 'court-f2', 0, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f2-1', 'court-f2', 1, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f2-2', 'court-f2', 2, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f2-3', 'court-f2', 3, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f2-4', 'court-f2', 4, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f2-5', 'court-f2', 5, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-f2-6', 'court-f2', 6, '06:00', '23:00', true, NOW(), NOW()),
  -- court-b1
  ('oh-b1-0', 'court-b1', 0, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-b1-1', 'court-b1', 1, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-b1-2', 'court-b1', 2, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-b1-3', 'court-b1', 3, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-b1-4', 'court-b1', 4, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-b1-5', 'court-b1', 5, '06:00', '23:00', true, NOW(), NOW()),
  ('oh-b1-6', 'court-b1', 6, '06:00', '23:00', true, NOW(), NOW()),
  -- court-b4 (rahasian, closes at 22:00)
  ('oh-b4-0', 'court-b4', 0, '07:00', '22:00', true, NOW(), NOW()),
  ('oh-b4-1', 'court-b4', 1, '07:00', '22:00', true, NOW(), NOW()),
  ('oh-b4-2', 'court-b4', 2, '07:00', '22:00', true, NOW(), NOW()),
  ('oh-b4-3', 'court-b4', 3, '07:00', '22:00', true, NOW(), NOW()),
  ('oh-b4-4', 'court-b4', 4, '07:00', '22:00', true, NOW(), NOW()),
  ('oh-b4-5', 'court-b4', 5, '07:00', '22:00', true, NOW(), NOW()),
  ('oh-b4-6', 'court-b4', 6, '07:00', '22:00', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== ADMINS ====================
INSERT INTO admins (id, username, name, email, password_hash, role, is_active, created_at, updated_at) VALUES
  ('admin-1', 'admin',      'Super Admin',   'admin@lapangin.id',  '$2b$10$PogPeENNeY9.gNDNbMg9mOAKWgPwExS8.o54sE/BHFH2LkTMNlzGy', 'super_admin', true, NOW(), NOW()),
  ('owner-1', 'venueowner', 'Venue Owner',   'owner@lapangin.id',  '$2b$10$8RkQCFdl7l/aC3czGPRGeOrx1CXhkl/ZJUCmS5p3AUVynuOuVdeyC', 'admin',       true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== BOOKINGS (demo) ====================
INSERT INTO bookings (id, booking_code, customer_name, customer_phone, customer_email, sport_id, venue_id, court_id, booking_date, start_time, end_time, duration_minutes, total_price, payment_status, booking_status, notes, expires_at, payment_submitted_at, payment_verified_at, payment_rejected_at, payment_rejection_reason, verified_by_admin_id, created_at, updated_at) VALUES
  ('booking-001', 'BK-260624-DEMO1', 'John Doe',  '081234567890', 'john@example.com',   'sport-futsal', 'venue-greenfield', 'court-f1', '2026-06-25', '19:00', '21:00', 120, 300000, 'paid',               'confirmed',    'Demo confirmed booking',        NULL, NULL, '2026-06-24T10:00:00Z', NULL, NULL, 'admin-1', NOW(), NOW()),
  ('booking-002', 'BK-260624-DEMO2', 'Jane Smith', '082345678901', 'jane@example.com',   'sport-futsal', 'venue-greenfield', 'court-f1', '2026-06-25', '21:00', '22:00', 60,  150000, 'waiting_confirmation', 'waiting_verification', 'Demo waiting for verification', '2026-06-24T09:00:00Z', '2026-06-24T09:10:00Z', NULL, NULL, NULL, NULL, NOW(), NOW()),
  ('booking-003', 'BK-260624-DEMO3', 'Bob Wilson', '083456789012', 'bob@example.com',    'sport-futsal', 'venue-greenfield', 'court-f1', '2026-06-26', '17:00', '19:00', 120, 300000, 'unpaid',              'waiting_payment', 'Demo waiting payment (active)',  (NOW() + INTERVAL '10 minutes')::timestamp, NULL, NULL, NULL, NULL, NULL, NOW(), NOW()),
  ('booking-004', 'BK-260624-DEMO4', 'Alice Brown','084567890123', 'alice@example.com',  'sport-futsal', 'venue-greenfield', 'court-f1', '2026-06-26', '19:00', '20:00', 60,  150000, 'unpaid',              'expired',       'Demo expired booking',           (NOW() - INTERVAL '30 minutes')::timestamp, NULL, NULL, NULL, NULL, NULL, NOW(), NOW()),
  ('booking-005', 'BK-260624-DEMO5', 'Charlie D.', '085678901234', 'charlie@example.com','sport-bulu-tangkis','venue-rahasian','court-b4','2026-06-25','20:00','21:00',60,90000, 'paid',              'confirmed',    'Demo confirmed badminton',       NULL, NULL, '2026-06-24T11:00:00Z', NULL, NULL, 'admin-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== PAYMENT METHODS ====================
INSERT INTO payment_methods (id, name, label, type, account_name, account_number, bank_name, is_active, instructions, created_at, updated_at) VALUES
  ('pm-1', 'BCA Transfer', 'BCA Transfer', 'bank_transfer', 'PT Lapangin Indonesia', '1234567890', 'BCA', true,  'Transfer ke rekening BCA atas nama PT Lapangin Indonesia. Setelah transfer, kirim bukti pembayaran.', NOW(), NOW()),
  ('pm-2', 'Mandiri Transfer', 'Mandiri Transfer', 'bank_transfer', 'PT Lapangin Indonesia', '0987654321', 'Mandiri', true, 'Transfer ke rekening Mandiri atas nama PT Lapangin Indonesia. Setelah transfer, kirim bukti pembayaran.', NOW(), NOW()),
  ('pm-3', 'QRIS', 'QRIS', 'qris', 'PT Lapangin Indonesia', 'QRIS-LAPANGIN', NULL, true, 'Scan QR code yang diberikan. Setelah transfer, kirim bukti pembayaran.', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;