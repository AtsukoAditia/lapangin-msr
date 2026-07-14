-- Recurring booking fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurring_group_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('weekly', 'biweekly', 'monthly'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;

CREATE INDEX IF NOT EXISTS bookings_recurring_idx ON bookings (recurring_group_id) WHERE recurring_group_id IS NOT NULL;
