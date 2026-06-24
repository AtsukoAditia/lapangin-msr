-- Lapangin PostgreSQL schema draft
-- Stage 12: Production readiness foundation

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE IF NOT EXISTS sports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  address text NOT NULL DEFAULT '',
  maps_url text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  open_time time NOT NULL DEFAULT '06:00',
  close_time time NOT NULL DEFAULT '23:00',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  name text NOT NULL,
  email citext NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'admin', 'staff')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

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
      'paid',
      'confirmed',
      'rejected',
      'cancelled',
      'completed',
      'no_show'
    )
  ),
  payment_status text NOT NULL CHECK (
    payment_status IN ('unpaid', 'waiting_confirmation', 'dp_paid', 'paid', 'refunded')
  ),
  payment_proof_url text,
  notes text,
  points_awarded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Production-grade anti double-booking.
-- Prevent overlapping active bookings on the same court and date.
ALTER TABLE bookings
  ADD CONSTRAINT IF NOT EXISTS bookings_no_active_overlap
  EXCLUDE USING gist (
    court_id WITH =,
    booking_date WITH =,
    tsrange(
      booking_date + start_time,
      booking_date + end_time,
      '[)'
    ) WITH &&
  )
  WHERE (booking_status IN ('pending', 'waiting_payment', 'paid', 'confirmed'));

CREATE INDEX IF NOT EXISTS bookings_court_date_idx ON bookings (court_id, booking_date);
CREATE INDEX IF NOT EXISTS bookings_customer_idx ON bookings (user_id);
CREATE INDEX IF NOT EXISTS bookings_code_idx ON bookings (booking_code);

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
