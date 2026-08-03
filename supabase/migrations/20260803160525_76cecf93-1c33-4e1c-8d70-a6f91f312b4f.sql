
CREATE OR REPLACE FUNCTION public.accept_partner_invite(_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  p public.partnerships;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO p FROM public.partnerships WHERE invite_code = _code;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid invite code'; END IF;
  IF p.inviter_id = auth.uid() THEN RAISE EXCEPTION 'cannot accept your own invite'; END IF;
  IF p.invitee_id IS NOT NULL AND p.invitee_id <> auth.uid() THEN RAISE EXCEPTION 'invite already used'; END IF;
  UPDATE public.partnerships SET invitee_id = auth.uid(), status = 'accepted' WHERE id = p.id;
  RETURN p.id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.accept_partner_invite(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.accept_partner_invite(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.join_group_by_code(_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  g public.groups;
  member_count integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT * INTO g FROM public.groups WHERE invite_code = _code;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid group code'; END IF;
  SELECT count(*) INTO member_count FROM public.group_members WHERE group_id = g.id;
  IF member_count >= 8 THEN RAISE EXCEPTION 'group is full'; END IF;
  INSERT INTO public.group_members (group_id, user_id)
  VALUES (g.id, auth.uid())
  ON CONFLICT (group_id, user_id) DO NOTHING;
  RETURN g.id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.join_group_by_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.join_group_by_code(text) TO authenticated;
