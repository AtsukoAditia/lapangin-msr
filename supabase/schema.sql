-- Lapangin Supabase schema — synced with Sprint 5 (Marketplace foundation)

-- ============================================================
-- Areas (Sprint 5)
-- ============================================================

create table areas (
  id text primary key,
  province text not null,
  city text not null,
  district text not null default '',
  village text not null default '',
  slug text not null unique,
  label text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Sports
-- ============================================================

create table sports (
  id text primary key,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Admins
-- ============================================================

create table admins (
  id text primary key,
  username text not null unique,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('super_admin', 'admin', 'staff', 'owner')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);

-- ============================================================
-- Venue owners (Sprint 5)
-- ============================================================

create table venue_owners (
  id text primary key,
  admin_id text references admins(id) on delete set null,
  business_name text not null,
  pic_name text not null,
  phone text not null,
  email text not null,
  status text not null check (status in ('pending_review', 'active', 'suspended', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Customers
-- ============================================================

create table customers (
  id text primary key,
  name text not null,
  email text unique,
  phone text not null,
  password_hash text not null,
  avatar text,
  is_verified boolean not null default false,
  is_active boolean not null default true,
  loyalty_points int not null default 0,
  total_spent int not null default 0,
  member_since timestamptz not null default now(),
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Venues (updated: owner_id, area_id, approval_status, description, facilities)
-- ============================================================

create table venues (
  id text primary key,
  name text not null,
  slug text not null unique,
  owner_id text references venue_owners(id) on delete set null,
  area_id text references areas(id) on delete set null,
  address text not null default '',
  description text not null default '',
  maps_url text not null default '',
  phone text not null default '',
  facilities jsonb not null default '[]',
  open_time time not null default '06:00',
  close_time time not null default '23:00',
  approval_status text not null default 'draft' check (approval_status in ('draft', 'pending_review', 'active', 'rejected', 'suspended')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index venues_owner_idx on venues(owner_id);
create index venues_area_idx on venues(area_id);

-- ============================================================
-- Courts
-- ============================================================

create table courts (
  id text primary key,
  venue_id text not null references venues(id) on delete cascade,
  sport_id text not null references sports(id) on delete restrict,
  name text not null,
  slug text not null,
  surface_type text not null default '',
  indoor_type text not null check (indoor_type in ('indoor', 'outdoor', 'semi_outdoor')),
  capacity int not null default 0,
  base_price int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (venue_id, slug)
);

-- ============================================================
-- Bookings (Sprint 2–4 fields: expires_at, waiting_verification, payment proof)
-- ============================================================

create table bookings (
  id text primary key,
  booking_code text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  user_id text references customers(id) on delete set null,
  venue_id text not null references venues(id) on delete restrict,
  court_id text not null references courts(id) on delete restrict,
  sport_id text not null references sports(id) on delete restrict,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  duration_minutes int not null,
  total_price int not null default 0,
  booking_status text not null default 'pending'
    check (booking_status in (
      'pending', 'waiting_payment', 'waiting_verification',
      'paid', 'confirmed', 'rejected', 'expired',
      'cancelled', 'completed', 'no_show'
    )),
  payment_status text not null default 'unpaid'
    check (payment_status in (
      'unpaid', 'waiting_confirmation', 'dp_paid',
      'paid', 'rejected', 'refunded'
    )),
  -- Sprint 2: temporary booking hold
  expires_at timestamptz,
  -- Sprint 4: payment proof
  payment_proof_url text,
  payment_submitted_at timestamptz,
  payment_verified_at timestamptz,
  payment_rejected_at timestamptz,
  payment_rejection_reason text,
  verified_by_admin_id text references admins(id) on delete set null,
  notes text,
  points_awarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index bookings_court_date_idx on bookings(court_id, booking_date);
create index bookings_customer_idx on bookings(user_id);
create index bookings_code_idx on bookings(booking_code);
create index bookings_status_idx on bookings(booking_status);
create index bookings_expires_idx on bookings(expires_at) where booking_status = 'waiting_payment';

-- ============================================================
-- Blocked slots
-- ============================================================

create table blocked_slots (
  id text primary key,
  court_id text not null references courts(id) on delete cascade,
  date date not null,
  start_time time not null,
  end_time time not null,
  reason text,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index blocked_slots_court_date_idx on blocked_slots(court_id, date);

-- ============================================================
-- Pricing rules
-- ============================================================

create table pricing_rules (
  id text primary key,
  court_id text not null references courts(id) on delete cascade,
  day_type text not null check (day_type in ('weekday', 'weekend', 'holiday', 'all')),
  start_time time not null,
  end_time time not null,
  price_per_hour int not null,
  priority int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

-- ============================================================
-- Payment methods
-- ============================================================

create table payment_methods (
  id text primary key,
  name text not null,
  label text not null,
  type text not null check (type in ('bank_transfer', 'e_wallet', 'qris', 'cash')),
  account_name text not null default '',
  account_number text,
  provider text not null default '',
  details text not null default '',
  instructions text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Audit logs
-- ============================================================

create table audit_logs (
  id text primary key,
  timestamp timestamptz not null default now(),
  action text not null,
  target_type text not null,
  target_id text not null,
  actor_type text not null check (actor_type in ('customer', 'admin', 'system')),
  actor_id text,
  details text not null default '',
  previous_value text,
  new_value text
);

-- ============================================================
-- Notification logs
-- ============================================================

create table notification_logs (
  id text primary key,
  type text not null,
  channel text not null,
  recipient text not null,
  subject text,
  message text not null,
  status text not null check (status in ('pending', 'sent', 'failed', 'read')),
  booking_id text references bookings(id) on delete set null,
  booking_code text,
  error_message text,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Loyalty transactions
-- ============================================================

create table loyalty_transactions (
  id text primary key,
  customer_id text not null references customers(id) on delete cascade,
  booking_id text references bookings(id) on delete set null,
  booking_code text,
  type text not null check (type in ('earned', 'redeemed', 'bonus', 'expired', 'adjusted')),
  points int not null,
  description text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);