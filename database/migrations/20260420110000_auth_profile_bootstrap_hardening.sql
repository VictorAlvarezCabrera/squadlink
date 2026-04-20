grant execute on function public.ensure_profile_for_user(uuid, text, jsonb) to authenticated;
grant execute on function public.ensure_profile_for_user(uuid, text, jsonb) to service_role;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_app_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_clan_manager(uuid) to authenticated;
