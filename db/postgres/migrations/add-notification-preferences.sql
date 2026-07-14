CREATE TABLE IF NOT EXISTS notification_preferences (
  id TEXT PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  fcm_token TEXT DEFAULT '',
  push_enabled BOOLEAN NOT NULL DEFAULT false,
  email_enabled BOOLEAN NOT NULL DEFAULT true,
  whatsapp_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS notif_prefs_customer_idx ON notification_preferences(customer_id);
