-- Lapangin PostgreSQL initial schema draft

create table sports (
  id text primary key,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table venues (
  id text primary key,
  name text not null,
  slug text not null unique,
  address text,
  maps_url text,
  phone text,
  open_time time,
  close_time time,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table courts (
  id text primary key,
  venue_id text not null references venues(id),
  sport_id text not null references sports(id),
  name text not null,
  slug text not null,
  surface_type text,
  indoor_type text,
  capacity int,
  base_price numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table bookings (
  id text primary key,
  booking_code text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  venue_id text not null references venues(id),
  court_id text not null references courts(id),
  sport_id text not null references sports(id),
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  duration_minutes int not null,
  total_price numeric(12,2) not null default 0,
  booking_status text not null default 'pending',
  payment_status text not null default 'unpaid',
  payment_proof_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_court_date_idx on bookings(court_id, booking_date);
create index bookings_status_idx on bookings(booking_status);

-- Production note:
-- Use stronger exclusion constraint or booking_slots table for real anti-overlap booking.
