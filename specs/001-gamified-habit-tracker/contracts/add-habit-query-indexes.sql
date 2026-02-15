-- Indexes for active habits query pattern used on dashboard load
CREATE INDEX IF NOT EXISTS idx_habits_user_active_created_at
ON habits(user_id, created_at)
WHERE is_active = TRUE;

