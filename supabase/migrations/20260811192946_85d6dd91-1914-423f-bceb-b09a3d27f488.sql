ALTER TABLE public.notification_preferences
  ADD COLUMN IF NOT EXISTS reengagement_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_chance_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_reengagement_sent_on date,
  ADD COLUMN IF NOT EXISTS last_chance_sent_on date;

CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  rewarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (referred_id)
);

GRANT SELECT, INSERT, UPDATE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they are part of"
  ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Referred user can create their referral"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = referred_id AND referrer_id <> auth.uid());

CREATE POLICY "Referrer can mark reward granted"
  ON public.referrals FOR UPDATE TO authenticated
  USING (auth.uid() = referrer_id)
  WITH CHECK (auth.uid() = referrer_id);

CREATE TRIGGER referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();