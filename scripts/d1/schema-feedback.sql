CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  username TEXT NOT NULL,
  user_name TEXT NOT NULL,
  role TEXT NOT NULL,
  category TEXT NOT NULL,
  module TEXT NOT NULL,
  comment TEXT NOT NULL,
  screenshot_b64 TEXT,
  screenshot_mime TEXT,
  status TEXT NOT NULL DEFAULT 'open'
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);
