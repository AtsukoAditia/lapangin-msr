-- ============================================================
-- Indonesian Public Holidays (Tanggal Merah)
-- Source: SKB 3 Menteri + additional religious holidays
-- ============================================================

CREATE TABLE IF NOT EXISTS holidays (
  id VARCHAR(50) PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('national', 'religious', 'joint_leave')),
  description TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS holidays_date_idx ON holidays (date);
CREATE INDEX IF NOT EXISTS holidays_active_idx ON holidays (is_active) WHERE is_active = true;

-- ============================================================
-- 2025-2027 Indonesian Holidays
-- ============================================================

INSERT INTO holidays (id, date, name, type, description, created_at) VALUES
  -- 2025
  ('h-2025-01-01', '2025-01-01', 'Tahun Baru 2025', 'national', '', NOW()),
  ('h-2025-01-27', '2025-01-27', 'Isra Mikraj Nabi Muhammad SAW', 'religious', '', NOW()),
  ('h-2025-01-29', '2025-01-29', 'Tahun Baru Imlek 2576', 'religious', '', NOW()),
  ('h-2025-03-29', '2025-03-29', 'Hari Raya Nyepi', 'religious', '', NOW()),
  ('h-2025-03-31', '2025-03-31', 'Wafat Isa Almasih', 'religious', '', NOW()),
  ('h-2025-04-18', '2025-04-18', 'Jumat Agung', 'religious', '', NOW()),
  ('h-2025-05-01', '2025-05-01', 'Hari Buruh Internasional', 'national', '', NOW()),
  ('h-2025-05-12', '2025-05-12', 'Hari Raya Waisak', 'religious', '', NOW()),
  ('h-2025-05-29', '2025-05-29', 'Kenaikan Isa Almasih', 'religious', '', NOW()),
  ('h-2025-06-01', '2025-06-01', 'Hari Lahir Pancasila', 'national', '', NOW()),
  ('h-2025-06-07', '2025-06-07', 'Hari Raya Idul Fitri 1446H', 'religious', '', NOW()),
  ('h-2025-06-08', '2025-06-08', 'Hari Raya Idul Fitri 1446H (H2)', 'religious', '', NOW()),
  ('h-2025-06-09', '2025-06-09', 'Cuti Bersama Idul Fitri', 'joint_leave', '', NOW()),
  ('h-2025-06-10', '2025-06-10', 'Cuti Bersama Idul Fitri', 'joint_leave', '', NOW()),
  ('h-2025-06-11', '2025-06-11', 'Cuti Bersama Idul Fitri', 'joint_leave', '', NOW()),
  ('h-2025-06-12', '2025-06-12', 'Cuti Bersama Idul Fitri', 'joint_leave', '', NOW()),
  ('h-2025-07-07', '2025-07-07', 'Hari Raya Idul Adha 1446H', 'religious', '', NOW()),
  ('h-2025-07-08', '2025-07-08', 'Cuti Bersama Idul Adha', 'joint_leave', '', NOW()),
  ('h-2025-07-27', '2025-07-27', 'Tahun Baru Islam 1447H', 'religious', '', NOW()),
  ('h-2025-08-17', '2025-08-17', 'Hari Kemerdekaan RI', 'national', '', NOW()),
  ('h-2025-09-05', '2025-09-05', 'Maulid Nabi Muhammad SAW', 'religious', '', NOW()),
  ('h-2025-12-25', '2025-12-25', 'Hari Raya Natal', 'religious', '', NOW()),
  ('h-2025-12-26', '2025-12-26', 'Cuti Bersama Natal', 'joint_leave', '', NOW()),

  -- 2026
  ('h-2026-01-01', '2026-01-01', 'Tahun Baru 2026', 'national', '', NOW()),
  ('h-2026-01-17', '2026-01-17', 'Isra Mikraj Nabi Muhammad SAW', 'religious', '', NOW()),
  ('h-2026-02-17', '2026-02-17', 'Tahun Baru Imlek 2577', 'religious', '', NOW()),
  ('h-2026-03-20', '2026-03-20', 'Hari Raya Nyepi', 'religious', '', NOW()),
  ('h-2026-03-21', '2026-03-21', 'Cuti Bersama Nyepi', 'joint_leave', '', NOW()),
  ('h-2026-04-03', '2026-04-03', 'Wafat Isa Almasih', 'religious', '', NOW()),
  ('h-2026-05-01', '2026-05-01', 'Hari Buruh Internasional', 'national', '', NOW()),
  ('h-2026-05-14', '2026-05-14', 'Kenaikan Isa Almasih', 'religious', '', NOW()),
  ('h-2026-05-26', '2026-05-26', 'Hari Raya Waisak', 'religious', '', NOW()),
  ('h-2026-05-27', '2026-05-27', 'Cuti Bersama Waisak', 'joint_leave', '', NOW()),
  ('h-2026-06-01', '2026-06-01', 'Hari Lahir Pancasila', 'national', '', NOW()),
  ('h-2026-05-27', '2026-05-27', 'Hari Raya Idul Fitri 1447H', 'religious', '', NOW()),
  ('h-2026-05-28', '2026-05-28', 'Hari Raya Idul Fitri 1447H (H2)', 'religious', '', NOW()),
  ('h-2026-05-29', '2026-05-29', 'Cuti Bersama Idul Fitri', 'joint_leave', '', NOW()),
  ('h-2026-06-26', '2026-06-26', 'Hari Raya Idul Adha 1447H', 'religious', '', NOW()),
  ('h-2026-06-27', '2026-06-27', 'Cuti Bersama Idul Adha', 'joint_leave', '', NOW()),
  ('h-2026-07-17', '2026-07-17', 'Tahun Baru Islam 1448H', 'religious', '', NOW()),
  ('h-2026-08-17', '2026-08-17', 'Hari Kemerdekaan RI', 'national', '', NOW()),
  ('h-2026-08-25', '2026-08-25', 'Maulid Nabi Muhammad SAW', 'religious', '', NOW()),
  ('h-2026-12-25', '2026-12-25', 'Hari Raya Natal', 'religious', '', NOW()),

  -- 2027
  ('h-2027-01-01', '2027-01-01', 'Tahun Baru 2027', 'national', '', NOW()),
  ('h-2027-01-07', '2027-01-07', 'Isra Mikraj Nabi Muhammad SAW', 'religious', '', NOW()),
  ('h-2027-02-06', '2027-02-06', 'Tahun Baru Imlek 2578', 'religious', '', NOW()),
  ('h-2027-03-10', '2027-03-10', 'Hari Raya Nyepi', 'religious', '', NOW()),
  ('h-2027-03-26', '2027-03-26', 'Wafat Isa Almasih', 'religious', '', NOW()),
  ('h-2027-05-01', '2027-05-01', 'Hari Buruh Internasional', 'national', '', NOW()),
  ('h-2027-05-16', '2027-05-16', 'Hari Raya Idul Fitri 1448H', 'religious', '', NOW()),
  ('h-2027-05-17', '2027-05-17', 'Hari Raya Idul Fitri 1448H (H2)', 'religious', '', NOW()),
  ('h-2027-06-01', '2027-06-01', 'Hari Lahir Pancasila', 'national', '', NOW()),
  ('h-2027-06-15', '2027-06-15', 'Hari Raya Idul Adha 1448H', 'religious', '', NOW()),
  ('h-2027-07-07', '2027-07-07', 'Tahun Baru Islam 1449H', 'religious', '', NOW()),
  ('h-2027-08-17', '2027-08-17', 'Hari Kemerdekaan RI', 'national', '', NOW()),
  ('h-2027-09-15', '2027-09-15', 'Maulid Nabi Muhammad SAW', 'religious', '', NOW()),
  ('h-2027-12-25', '2027-12-25', 'Hari Raya Natal', 'religious', '', NOW())
ON CONFLICT (id) DO NOTHING;
