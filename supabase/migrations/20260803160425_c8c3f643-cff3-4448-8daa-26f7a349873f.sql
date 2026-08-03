
CREATE TABLE public.user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  weekly_workouts integer NOT NULL DEFAULT 0,
  total_workouts integer NOT NULL DEFAULT 0,
  last_workout_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_stats TO authenticated;
GRANT ALL ON public.user_stats TO service_role;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_partner_of(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partnerships
    WHERE status = 'accepted'
      AND ((inviter_id = _a AND invitee_id = _b) OR (inviter_id = _b AND invitee_id = _a))
  );
$$;
REVOKE EXECUTE ON FUNCTION public.is_partner_of(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.shares_group_with(_a uuid, _b uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members m1
    JOIN public.group_members m2 ON m1.group_id = m2.group_id
    WHERE m1.user_id = _a AND m2.user_id = _b
  );
$$;
REVOKE EXECUTE ON FUNCTION public.shares_group_with(uuid, uuid) FROM PUBLIC, anon, authenticated;

CREATE POLICY "view own or connected stats" ON public.user_stats FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_partner_of(user_id, auth.uid()) OR public.shares_group_with(user_id, auth.uid()));
CREATE POLICY "insert own stats" ON public.user_stats FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own stats" ON public.user_stats FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete own stats" ON public.user_stats FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER user_stats_updated_at BEFORE UPDATE ON public.user_stats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
