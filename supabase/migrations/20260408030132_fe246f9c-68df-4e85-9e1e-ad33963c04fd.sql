
-- Add user_id column (nullable initially for existing data)
ALTER TABLE public.workout_logs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can insert workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Anyone can read workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Anyone can update workout logs" ON public.workout_logs;

-- Create user-scoped RLS policies
CREATE POLICY "Users can view their own workout logs"
ON public.workout_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout logs"
ON public.workout_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout logs"
ON public.workout_logs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout logs"
ON public.workout_logs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
