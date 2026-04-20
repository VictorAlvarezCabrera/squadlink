create extension if not exists citext;

alter table public.games
  add column if not exists rawg_id bigint,
  add column if not exists cover_url text,
  add column if not exists background_image text,
  add column if not exists released_at date,
  add column if not exists last_synced_at timestamptz;

create unique index if not exists idx_games_rawg_id_unique
  on public.games(rawg_id)
  where rawg_id is not null;

alter table public.clans
  add column if not exists requirements text[] not null default '{}';

alter table public.notifications
  add column if not exists read_at timestamptz,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

drop trigger if exists set_notifications_updated_at on public.notifications;
create trigger set_notifications_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

alter table public.reviews
  add column if not exists target_clan_id uuid references public.clans(id) on delete cascade;

alter table public.reviews
  alter column target_profile_id drop not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reviews_target_check'
  ) then
    alter table public.reviews
      add constraint reviews_target_check
      check (
        (kind = 'player' and target_profile_id is not null and target_clan_id is null)
        or (kind = 'clan' and target_clan_id is not null and target_profile_id is null)
      );
  end if;
end $$;

alter table if exists public.clan_join_requests
  drop constraint if exists clan_join_requests_clan_id_profile_id_status_key;
create unique index if not exists idx_clan_join_requests_single_pending
  on public.clan_join_requests(clan_id, profile_id)
  where status = 'pending';

create unique index if not exists idx_clan_invitations_single_pending
  on public.clan_invitations(clan_id, profile_id)
  where status = 'pending';

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select role from public.profiles where user_id = auth.uid() limit 1
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(public.current_app_role() = 'admin', false)
$$;

create or replace function public.is_clan_manager(target_clan_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.clans c
    left join public.clan_members cm
      on cm.clan_id = c.id
     and cm.profile_id = public.current_profile_id()
    where c.id = target_clan_id
      and (
        c.leader_profile_id = public.current_profile_id()
        or cm.role_code in ('leader', 'officer')
      )
  )
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
  base_nick text;
begin
  select *
  into created_profile
  from public.profiles
  where user_id = target_user_id;

  if found then
    return created_profile;
  end if;

  base_nick := coalesce(nullif(target_meta ->> 'nick', ''), split_part(target_email, '@', 1), 'player');

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
    lower(regexp_replace(base_nick, '[^a-zA-Z0-9_]+', '', 'g')) || '_' || substr(target_user_id::text, 1, 6),
    coalesce(nullif(target_meta ->> 'full_name', ''), nullif(target_meta ->> 'nick', ''), split_part(target_email, '@', 1)),
    '',
    'Europe/Madrid',
    'player'
  )
  returning * into created_profile;

  return created_profile;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_profile_for_user(new.id, new.email, coalesce(new.raw_user_meta_data, '{}'::jsonb));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.games enable row level security;
alter table public.platforms enable row level security;

drop policy if exists "catalog readable games" on public.games;
create policy "catalog readable games"
on public.games for select
using (true);

drop policy if exists "catalog admin manage games" on public.games;
create policy "catalog admin manage games"
on public.games for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "catalog readable platforms" on public.platforms;
create policy "catalog readable platforms"
on public.platforms for select
using (true);

drop policy if exists "catalog admin manage platforms" on public.platforms;
create policy "catalog admin manage platforms"
on public.platforms for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public clans readable" on public.clans;
create policy "public clans readable"
on public.clans for select
using (
  visibility = 'public'
  or exists (
    select 1
    from public.clan_members cm
    where cm.clan_id = clans.id
      and cm.profile_id = public.current_profile_id()
  )
  or public.is_admin()
);

drop policy if exists "leaders manage own clans" on public.clans;
create policy "leaders manage own clans"
on public.clans for all
using (
  leader_profile_id = public.current_profile_id()
  or public.is_admin()
)
with check (
  leader_profile_id = public.current_profile_id()
  or public.is_admin()
);

drop policy if exists "leaders manage memberships" on public.clan_members;
create policy "leaders manage memberships"
on public.clan_members for all
using (
  public.is_clan_manager(clan_id)
  or public.is_admin()
)
with check (
  public.is_clan_manager(clan_id)
  or public.is_admin()
);

drop policy if exists "requests readable by applicant or leader" on public.clan_join_requests;
create policy "requests readable by applicant or leader"
on public.clan_join_requests for select
using (
  profile_id = public.current_profile_id()
  or public.is_clan_manager(clan_id)
  or public.is_admin()
);

drop policy if exists "players create own requests" on public.clan_join_requests;
create policy "players create own requests"
on public.clan_join_requests for insert
with check (
  profile_id = public.current_profile_id()
  and not exists (
    select 1
    from public.clan_members cm
    where cm.clan_id = clan_join_requests.clan_id
      and cm.profile_id = public.current_profile_id()
  )
);

drop policy if exists "leaders update requests" on public.clan_join_requests;
create policy "leaders update requests"
on public.clan_join_requests for update
using (
  public.is_clan_manager(clan_id)
  or public.is_admin()
)
with check (
  public.is_clan_manager(clan_id)
  or public.is_admin()
);

drop policy if exists "invitations visible to parties" on public.clan_invitations;
create policy "invitations visible to parties"
on public.clan_invitations for select
using (
  profile_id = public.current_profile_id()
  or invited_by_profile_id = public.current_profile_id()
  or public.is_clan_manager(clan_id)
  or public.is_admin()
);

drop policy if exists "leaders manage invitations" on public.clan_invitations;
create policy "leaders manage invitations"
on public.clan_invitations for all
using (
  public.is_clan_manager(clan_id)
  or public.is_admin()
)
with check (
  public.is_clan_manager(clan_id)
  or public.is_admin()
);

drop policy if exists "events readable" on public.events;
create policy "events readable"
on public.events for select
using (
  visibility = 'public'
  or exists (
    select 1 from public.clan_members cm
    where cm.clan_id = events.clan_id
      and cm.profile_id = public.current_profile_id()
  )
  or public.is_admin()
);

drop policy if exists "leaders create events" on public.events;
create policy "leaders create events"
on public.events for all
using (
  public.is_clan_manager(clan_id)
  or public.is_admin()
)
with check (
  public.is_clan_manager(clan_id)
  or public.is_admin()
);

drop policy if exists "reports visible to reporter" on public.reports;
create policy "reports visible to reporter"
on public.reports for select
using (
  reporter_profile_id = public.current_profile_id()
  or public.is_admin()
);

drop policy if exists "reports self create" on public.reports;
create policy "reports self create"
on public.reports for insert
with check (
  reporter_profile_id = public.current_profile_id()
  or public.is_admin()
);

drop policy if exists "reports admin update" on public.reports;
create policy "reports admin update"
on public.reports for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "notifications self read" on public.notifications;
create policy "notifications self read"
on public.notifications for select
using (
  profile_id = public.current_profile_id()
  or public.is_admin()
);

drop policy if exists "notifications self update" on public.notifications;
create policy "notifications self update"
on public.notifications for update
using (
  profile_id = public.current_profile_id()
  or public.is_admin()
)
with check (
  profile_id = public.current_profile_id()
  or public.is_admin()
);
