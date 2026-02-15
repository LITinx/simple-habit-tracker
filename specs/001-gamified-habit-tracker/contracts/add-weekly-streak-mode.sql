-- Add streak calculation preference for weekly habits
ALTER TABLE habits
ADD COLUMN IF NOT EXISTS weekly_streak_mode TEXT NOT NULL DEFAULT 'days'
CHECK (weekly_streak_mode IN ('days', 'weeks'));

