create extension if not exists citext;

alter table public.profiles
  alter column nick type citext
  using nick::citext;

create or replace function public.sanitize_nick(raw_nick text)
returns text
language sql
immutable
as $$
  select nullif(
    left(
      regexp_replace(trim(coalesce(raw_nick, '')), '[^A-Za-z0-9_-]+', '', 'g'),
      20
    ),
    ''
  )
$$;

create or replace function public.build_unique_nick(base_nick text, target_user_id uuid)
returns citext
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_base text;
  candidate text;
  suffix text;
  attempt integer := 0;
begin
  normalized_base := coalesce(public.sanitize_nick(base_nick), 'player');
  candidate := normalized_base;

  while exists (
    select 1
    from public.profiles
    where lower(nick::text) = lower(candidate)
      and user_id <> target_user_id
  ) loop
    attempt := attempt + 1;
    suffix := '_' || attempt::text;
    candidate := left(normalized_base, greatest(1, 20 - char_length(suffix))) || suffix;
  end loop;

  return candidate::citext;
end;
$$;

create or replace function public.ensure_profile_for_user(
  target_user_id uuid,
  target_email text,
  target_meta jsonb default '{}'::jsonb
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  created_profile public.profiles;
  requested_nick text;
  fallback_nick text;
  final_nick citext;
begin
  select *
  into created_profile
  from public.profiles
  where user_id = target_user_id;

  if found then
    return created_profile;
  end if;

  requested_nick := public.sanitize_nick(target_meta ->> 'nick');

  if requested_nick is not null then
    if exists (
      select 1
      from public.profiles
      where lower(nick::text) = lower(requested_nick)
        and user_id <> target_user_id
    ) then
      raise exception 'El nick ya esta en uso.'
        using errcode = '23505';
    end if;

    final_nick := requested_nick::citext;
  else
    fallback_nick := coalesce(
      public.sanitize_nick(split_part(coalesce(target_email, ''), '@', 1)),
      'player'
    );
    final_nick := public.build_unique_nick(fallback_nick, target_user_id);
  end if;

  insert into public.profiles (
    user_id,
    nick,
    full_name,
    bio,
    timezone,
    role
  )
  values (
    target_user_id,
    final_nick,
    coalesce(
      nullif(trim(coalesce(target_meta ->> 'full_name', '')), ''),
      requested_nick,
      split_part(coalesce(target_email, ''), '@', 1),
      final_nick::text
    ),
    '',
    'Europe/Madrid',
    'player'
  )
  returning * into created_profile;

  return created_profile;
end;
$$;

grant execute on function public.ensure_profile_for_user(uuid, text, jsonb) to authenticated;
grant execute on function public.ensure_profile_for_user(uuid, text, jsonb) to service_role;
