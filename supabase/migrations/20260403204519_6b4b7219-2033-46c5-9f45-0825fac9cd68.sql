
ALTER TABLE public.workout_logs 
  ADD COLUMN plank_seconds integer NOT NULL DEFAULT 0,
  ADD COLUMN deadhang_seconds integer NOT NULL DEFAULT 0,
  ADD COLUMN squat_count integer NOT NULL DEFAULT 0,
  ADD COLUMN squat_weight numeric NOT NULL DEFAULT 0,
  ADD COLUMN squat_unit text NOT NULL DEFAULT 'lb';
