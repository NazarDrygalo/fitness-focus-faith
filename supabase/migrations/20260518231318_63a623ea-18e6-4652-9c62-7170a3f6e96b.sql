
DROP POLICY IF EXISTS "Users can create their own goals" ON public.workout_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.workout_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.workout_goals;
DROP POLICY IF EXISTS "Users can view their own goals" ON public.workout_goals;

CREATE POLICY "Users can create their own goals" ON public.workout_goals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.workout_goals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.workout_goals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own goals" ON public.workout_goals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
