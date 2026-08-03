
CREATE POLICY "public stats are viewable" ON public.user_stats FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = user_stats.user_id AND p.is_public = true));
GRANT SELECT ON public.user_stats TO anon;
GRANT SELECT ON public.profiles TO anon;
