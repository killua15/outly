-- Add viral score columns to outliers table
ALTER TABLE outliers
  ADD COLUMN IF NOT EXISTS viral_score      NUMERIC(4,2),
  ADD COLUMN IF NOT EXISTS score_hook       SMALLINT,
  ADD COLUMN IF NOT EXISTS score_topic      SMALLINT,
  ADD COLUMN IF NOT EXISTS score_repeatability SMALLINT,
  ADD COLUMN IF NOT EXISTS score_emotion    SMALLINT,
  ADD COLUMN IF NOT EXISTS score_label      TEXT,
  ADD COLUMN IF NOT EXISTS score_reason     TEXT;
