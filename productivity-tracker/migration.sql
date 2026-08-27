-- Drop the unique constraint so multiple notes can be saved per day
ALTER TABLE daily_journals DROP CONSTRAINT IF EXISTS daily_journals_user_id_date_key;

-- Add a column for the day rating (Part 2)
ALTER TABLE daily_journals ADD COLUMN IF NOT EXISTS rating integer check (rating >= 1 and rating <= 5);

-- Add a created_at column so we can sort multiple notes on the same day chronologically
ALTER TABLE daily_journals ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now()) not null;
