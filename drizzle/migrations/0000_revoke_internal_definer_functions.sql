REVOKE EXECUTE ON FUNCTION public.get_cron_secret() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_group_member(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_partner_of(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.shares_group_with(uuid, uuid) FROM anon, authenticated, public;