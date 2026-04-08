
-- Drop old unique constraint if it exists
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'workout_logs_workout_date_key') THEN
    ALTER TABLE public.workout_logs DROP CONSTRAINT workout_logs_workout_date_key;
  END IF;
END $$;

-- Add composite unique constraint
ALTER TABLE public.workout_logs ADD CONSTRAINT workout_logs_user_date_unique UNIQUE (user_id, workout_date);
