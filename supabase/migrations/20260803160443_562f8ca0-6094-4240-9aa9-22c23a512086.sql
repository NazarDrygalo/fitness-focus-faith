
CREATE POLICY "connected users view profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_partner_of(id, auth.uid()) OR public.shares_group_with(id, auth.uid()));
