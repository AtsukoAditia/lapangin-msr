-- Lapangin PostgreSQL schema draft
-- Updated: Sprint 5 — Marketplace foundation

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================
-- Areas (Sprint 5 — marketplace regions)
-- ============================================================

CREATE TABLE IF NOT EXISTS areas (
  id VARCHAR(50) PRIMARY KEY,
  province VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  village VARCHAR(100) NOT NULL DEFAULT '',
  slug VARCHAR(150) UNIQUE NOT NULL,
  label VARCHAR(500) NOT NULL DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS areas_slug_idx ON areas (slug);

-- ============================================================
-- Sports
-- ============================================================

CREATE TABLE IF NOT EXISTS sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Venue owners (Sprint 5 — marketplace owners)
-- ============================================================

CREATE TABLE IF NOT EXISTS venue_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
  business_name text NOT NULL,
  pic_name text NOT NULL,
  phone text NOT NULL,
  email citext NOT NULL,
  status text NOT NULL CHECK (status IN ('pending_review', 'active', 'suspended', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Venues (updated: owner_id, area_id, approval_status, description, facilities)
-- ============================================================

CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  owner_id uuid REFERENCES venue_owners(id) ON DELETE SET NULL,
  area_id uuid REFERENCES areas(id) ON DELETE SET NULL,
  address text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  maps_url text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  facilities jsonb NOT NULL DEFAULT '[]',
  open_time time NOT NULL DEFAULT '06:00',
  close_time time NOT NULL DEFAULT '23:00',
  approval_status text NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending_review', 'active', 'rejected', 'suspended')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS venues_owner_idx ON venues (owner_id);
CREATE INDEX IF NOT EXISTS venues_area_idx ON venues (area_id);

-- ============================================================
-- Courts
-- ============================================================

CREATE TABLE IF NOT EXISTS courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  sport_id uuid NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL,
  surface_type text NOT NULL DEFAULT '',
  indoor_type text NOT NULL CHECK (indoor_type IN ('indoor', 'outdoor', 'semi_outdoor')),
  capacity integer NOT NULL DEFAULT 0,
  base_price integer NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (venue_id, slug)
);

-- ============================================================
-- Customers
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email citext UNIQUE,
  phone text NOT NULL,
  password_hash text NOT NULL,
  avatar text,
  is_verified boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  loyalty_points integer NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  total_spent integer NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  member_since timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Admins
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  name text NOT NULL,
  email citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'staff', 'owner')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

-- ============================================================
-- Bookings (updated: expires_at, waiting_verification, payment proof fields)
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email citext,
  user_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
  sport_id uuid NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  total_price integer NOT NULL CHECK (total_price >= 0),
  booking_status text NOT NULL CHECK (
    booking_status IN (
      'pending',
      'waiting_payment',
      'waiting_verification',
      'paid',
      'confirmed',
      'rejected',
      'expired',
      'cancelled',
      'completed',
      'no_show'
    )
  ),
  payment_status text NOT NULL CHECK (
    payment_status IN ('unpaid', 'waiting_confirmation', 'dp_paid', 'paid', 'rejected', 'refunded')
  ),
  -- Sprint 2: temporary booking hold
  expires_at timestamptz,
  -- Sprint 4: payment proof fields
  payment_proof_url text,
  payment_submitted_at timestamptz,
  payment_verified_at timestamptz,
  payment_rejected_at timestamptz,
  payment_rejection_reason text,
  verified_by_admin_id uuid REFERENCES admins(id) ON DELETE SET NULL,
  notes text,
  points_awarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Overlap constraint: active bookings block double-booking
-- Updated: includes waiting_verification and excludes expired
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_no_active_overlap'
  ) THEN
    ALTER TABLE bookings
      ADD CONSTRAINT bookings_no_active_overlap
      EXCLUDE USING gist (
        court_id WITH =,
        booking_date WITH =,
        tsrange(
          booking_date + start_time,
          booking_date + end_time,
          '[)'
        ) WITH &&
      )
      WHERE (booking_status IN ('waiting_payment', 'waiting_verification', 'paid', 'confirmed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS bookings_court_date_idx ON bookings (court_id, booking_date);
CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings (user_id);
CREATE INDEX IF NOT EXISTS bookings_code_idx ON bookings (booking_code);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (booking_status);
CREATE INDEX IF NOT EXISTS bookings_expires_idx ON bookings (expires_at) WHERE booking_status = 'waiting_payment';

-- ============================================================
-- Blocked slots
-- ============================================================

CREATE TABLE IF NOT EXISTS blocked_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS blocked_slots_court_date_idx ON blocked_slots (court_id, date);

-- ============================================================
-- Pricing rules
-- ============================================================

CREATE TABLE IF NOT EXISTS pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  day_type text NOT NULL CHECK (day_type IN ('weekday', 'weekend', 'holiday', 'all')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  price_per_hour integer NOT NULL CHECK (price_per_hour >= 0),
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- ============================================================
-- Payment methods
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  label text NOT NULL,
  type text NOT NULL CHECK (type IN ('bank_transfer', 'e_wallet', 'qris', 'cash')),
  account_name text NOT NULL DEFAULT '',
  account_number text,
  provider text NOT NULL DEFAULT '',
  details text NOT NULL DEFAULT '',
  instructions text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Audit logs
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz NOT NULL DEFAULT now(),
  action text NOT NULL,
  target_type text NOT NULL,
  target_id uuid NOT NULL,
  actor_type text NOT NULL CHECK (actor_type IN ('customer', 'admin', 'system')),
  actor_id uuid,
  details text NOT NULL DEFAULT '',
  previous_value text,
  new_value text
);

-- ============================================================
-- Notification logs
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  channel text NOT NULL,
  recipient text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  booking_code text,
  error_message text,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- Loyalty transactions
-- ============================================================

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  booking_code text,
  type text NOT NULL CHECK (type IN ('earned', 'redeemed', 'bonus', 'expired', 'adjusted')),
  points integer NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_one_earned_tx_per_booking
  ON loyalty_transactions (booking_id)
  WHERE type = 'earned' AND booking_id IS NOT NULL;