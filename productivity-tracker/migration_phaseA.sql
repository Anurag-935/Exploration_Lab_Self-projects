ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority integer default 3;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS time_estimate integer default 0;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS exp_value integer default 10;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type text default 'Short Task' check (task_type in ('Short Task', 'Habit', 'Long Plan'));
