ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'manual' CHECK (payment_method IN ('manual', 'midtrans'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS midtrans_order_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS midtrans_transaction_id TEXT;
