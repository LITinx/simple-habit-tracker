-- Add customizable progress question to habits
ALTER TABLE habits
ADD COLUMN IF NOT EXISTS progress_question TEXT
CHECK (char_length(progress_question) <= 200);

ALTER TABLE habits
ALTER COLUMN progress_question SET DEFAULT 'How did this habit go today?';

UPDATE habits
SET progress_question = 'How did this habit go today?'
WHERE progress_question IS NULL;

-- Timeline entries for per-habit progress tracking
CREATE TABLE IF NOT EXISTS habit_timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  note TEXT CHECK (char_length(note) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(habit_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_timeline_entries_habit_date
  ON habit_timeline_entries(habit_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS idx_habit_timeline_entries_user_created
  ON habit_timeline_entries(user_id, created_at DESC);

ALTER TABLE habit_timeline_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own timeline entries"
  ON habit_timeline_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own timeline entries"
  ON habit_timeline_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own timeline entries"
  ON habit_timeline_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own timeline entries"
  ON habit_timeline_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER on_habit_timeline_entries_updated
  BEFORE UPDATE ON habit_timeline_entries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
