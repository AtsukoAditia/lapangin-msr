-- Lapangin PostgreSQL schema
-- Aligned with seed.sql and app needs

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================
-- Areas
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
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Admins (before venue_owners which refs admins)
-- ============================================================

CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(50) PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'staff', 'owner')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ============================================================
-- Venue owners
-- ============================================================

CREATE TABLE IF NOT EXISTS venue_owners (
  id VARCHAR(50) PRIMARY KEY,
  admin_id VARCHAR(50) REFERENCES admins(id) ON DELETE SET NULL,
  business_name TEXT NOT NULL,
  pic_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email CITEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending_review', 'active', 'suspended', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Venues
-- ============================================================

CREATE TABLE IF NOT EXISTS venues (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id VARCHAR(50) REFERENCES venue_owners(id) ON DELETE SET NULL,
  area_id VARCHAR(50) REFERENCES areas(id) ON DELETE SET NULL,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  maps_url TEXT NOT NULL DEFAULT '',
  open_time TIME NOT NULL DEFAULT '06:00',
  close_time TIME NOT NULL DEFAULT '23:00',
  facilities JSONB NOT NULL DEFAULT '[]',
  images JSONB,
  approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'pending_review', 'active', 'rejected', 'suspended')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS venues_owner_idx ON venues (owner_id);
CREATE INDEX IF NOT EXISTS venues_area_idx ON venues (area_id);
ALTER TABLE venues ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;

-- ============================================================
-- Courts
-- ============================================================

CREATE TABLE IF NOT EXISTS courts (
  id VARCHAR(50) PRIMARY KEY,
  venue_id VARCHAR(50) NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  sport_id VARCHAR(50) NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  surface_type TEXT NOT NULL DEFAULT '',
  indoor_type TEXT NOT NULL CHECK (indoor_type IN ('indoor', 'outdoor', 'semi_outdoor')),
  capacity INTEGER NOT NULL DEFAULT 0,
  base_price INTEGER NOT NULL DEFAULT 0 CHECK (base_price >= 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (venue_id, slug)
);

-- ============================================================
-- Customers
-- ============================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email CITEXT UNIQUE,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  avatar TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
  total_spent INTEGER NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  member_since TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Bookings
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(50) PRIMARY KEY,
  booking_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email CITEXT,
  user_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  venue_id VARCHAR(50) NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  court_id VARCHAR(50) NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
  sport_id VARCHAR(50) NOT NULL REFERENCES sports(id) ON DELETE RESTRICT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  booking_status TEXT NOT NULL CHECK (
    booking_status IN (
      'pending', 'waiting_payment', 'waiting_verification',
      'paid', 'confirmed', 'rejected', 'expired',
      'cancelled', 'completed', 'no_show'
    )
  ),
  payment_status TEXT NOT NULL CHECK (
    payment_status IN ('unpaid', 'waiting_confirmation', 'dp_paid', 'paid', 'rejected', 'refunded')
  ),
  expires_at TIMESTAMPTZ,
  payment_proof_url TEXT,
  payment_submitted_at TIMESTAMPTZ,
  payment_verified_at TIMESTAMPTZ,
  payment_rejected_at TIMESTAMPTZ,
  payment_rejection_reason TEXT,
  verified_by_admin_id VARCHAR(50) REFERENCES admins(id) ON DELETE SET NULL,
  notes TEXT,
  points_awarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

-- Overlap constraint
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
        tsrange(booking_date + start_time, booking_date + end_time, '[)') WITH &&
      )
      WHERE (booking_status IN ('waiting_payment', 'waiting_verification', 'paid', 'confirmed'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS bookings_court_date_idx ON bookings (court_id, booking_date);
CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings (user_id);
CREATE INDEX IF NOT EXISTS bookings_code_idx ON bookings (booking_code);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (booking_status);

-- ============================================================
-- Blocked slots
-- ============================================================

CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id VARCHAR(50) NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

-- ============================================================
-- Pricing rules
-- ============================================================

CREATE TABLE IF NOT EXISTS pricing_rules (
  id VARCHAR(50) PRIMARY KEY,
  court_id VARCHAR(50) NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  day_type TEXT NOT NULL CHECK (day_type IN ('weekday', 'weekend', 'holiday', 'all')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price_per_hour INTEGER NOT NULL CHECK (price_per_hour >= 0),
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

-- ============================================================
-- Operating hours
-- ============================================================

CREATE TABLE IF NOT EXISTS operating_hours (
  id VARCHAR(50) PRIMARY KEY,
  court_id VARCHAR(50) NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Payment methods
-- ============================================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bank_transfer', 'e_wallet', 'qris', 'cash')),
  account_name TEXT NOT NULL DEFAULT '',
  account_number TEXT,
  bank_name TEXT,
  provider TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '',
  instructions TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Audit logs
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'admin', 'system')),
  actor_id TEXT,
  details TEXT NOT NULL DEFAULT '',
  previous_value TEXT,
  new_value TEXT
);

-- ============================================================
-- Notification logs
-- ============================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  channel TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'read')),
  booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
  booking_code TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Loyalty transactions
-- ============================================================

CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
  booking_code TEXT,
  type TEXT NOT NULL CHECK (type IN ('earned', 'redeemed', 'bonus', 'expired', 'adjusted')),
  points INTEGER NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS loyalty_one_earned_tx_per_booking
  ON loyalty_transactions (booking_id)
  WHERE type = 'earned' AND booking_id IS NOT NULL;

-- ============================================================
-- Reviews
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(50) PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  venue_id VARCHAR(50) NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  court_id VARCHAR(50) REFERENCES courts(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL DEFAULT '',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_venue_idx ON reviews (venue_id);
CREATE INDEX IF NOT EXISTS reviews_customer_idx ON reviews (customer_id);
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_booking ON reviews (booking_id);

-- ============================================================
-- Review Photos
-- ============================================================

CREATE TABLE IF NOT EXISTS review_photos (
  id VARCHAR(50) PRIMARY KEY,
  review_id VARCHAR(50) NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS review_photos_review_idx ON review_photos (review_id);

-- ============================================================
-- Rewards
-- ============================================================

CREATE TABLE IF NOT EXISTS rewards (
  id VARCHAR(50) PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('discount_percentage', 'discount_amount', 'free_hour', 'free_session')),
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  value INTEGER NOT NULL CHECK (value > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Reward Redemptions
-- ============================================================

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id VARCHAR(50) PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reward_id VARCHAR(50) NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
  reward_name TEXT NOT NULL,
  points_used INTEGER NOT NULL CHECK (points_used > 0),
  booking_id VARCHAR(50) REFERENCES bookings(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS reward_redemptions_customer_idx ON reward_redemptions (customer_id);

-- ============================================================
-- Referrals
-- ============================================================

CREATE TABLE IF NOT EXISTS referrals (
  id VARCHAR(50) PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  referral_code VARCHAR(20) NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS referrals_referrer_idx ON referrals (referrer_id);
CREATE INDEX IF NOT EXISTS referrals_code_idx ON referrals (referral_code);