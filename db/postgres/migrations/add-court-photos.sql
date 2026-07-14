CREATE TABLE IF NOT EXISTS court_photos (
  id TEXT PRIMARY KEY,
  court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS court_photos_idx ON court_photos(court_id);
