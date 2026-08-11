CREATE POLICY "Referred user can mark reward earned"
  ON public.referrals FOR UPDATE TO authenticated
  USING (auth.uid() = referred_id)
  WITH CHECK (auth.uid() = referred_id);