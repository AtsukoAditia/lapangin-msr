-- Commission system: venue-level commission settings + booking-level payout tracking

-- Venue commission columns
ALTER TABLE venues ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS platform_fee_type TEXT NOT NULL DEFAULT 'percentage' CHECK (platform_fee_type IN ('percentage', 'fixed'));
ALTER TABLE venues ADD COLUMN IF NOT EXISTS platform_fee_value NUMERIC(12,2) NOT NULL DEFAULT 0;

-- Booking commission columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_amount INT NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS owner_payout INT NOT NULL DEFAULT 0;
