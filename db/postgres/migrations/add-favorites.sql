CREATE TABLE IF NOT EXISTS customer_favorites (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, venue_id)
);
CREATE INDEX IF NOT EXISTS favorites_customer_idx ON customer_favorites(customer_id);
