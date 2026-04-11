-- Add notes column to workout_logs
ALTER TABLE public.workout_logs ADD COLUMN notes text DEFAULT '' NOT NULL;

-- Create workout_goals table
CREATE TABLE public.workout_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  pushups integer NOT NULL DEFAULT 0,
  situps integer NOT NULL DEFAULT 0,
  ladder_percent integer NOT NULL DEFAULT 0,
  plank_seconds integer NOT NULL DEFAULT 0,
  deadhang_seconds integer NOT NULL DEFAULT 0,
  squat_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.workout_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" ON public.workout_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.workout_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.workout_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.workout_goals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_workout_goals_updated_at
BEFORE UPDATE ON public.workout_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();