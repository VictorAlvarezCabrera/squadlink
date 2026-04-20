do $$
begin
  if not exists (select 1 from pg_type where typname = 'follow_target_type') then
    create type public.follow_target_type as enum ('profile', 'clan');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'post_visibility') then
    create type public.post_visibility as enum ('public', 'followers', 'clan');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'link_status') then
    create type public.link_status as enum ('pending', 'linked', 'error', 'revoked');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'game_support_status') then
    create type public.game_support_status as enum ('active', 'planned', 'disabled');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'response_status') then
    create type public.response_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
  end if;
end $$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'moderation_action_type') then
    create type public.moderation_action_type as enum ('hide_content', 'unhide_content', 'block_user', 'unblock_user', 'close_report');
  end if;
end $$;

create table if not exists public.app_roles (
  code text primary key,
  name text not null unique
);

insert into public.app_roles (code, name)
values
  ('user', 'Usuario'),
  ('admin', 'Administrador')
on conflict (code) do update set name = excluded.name;

create table if not exists public.user_app_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_code text not null references public.app_roles(code) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role_code)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  type text not null,
  alt_text text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.supported_games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  cover_url text,
  is_stats_supported boolean not null default false,
  status public.game_support_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.game_api_sources (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.supported_games(id) on delete cascade,
  provider text not null,
  auth_type text not null,
  official boolean not null default true,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (game_id, provider)
);

create table if not exists public.profile_platforms (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  platform_id uuid not null references public.platforms(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (profile_id, platform_id)
);

create table if not exists public.profile_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid references public.supported_games(id) on delete cascade,
  role_code text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, game_id, role_code)
);

create table if not exists public.profile_availability (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default timezone('utc', now()),
  check (end_time > start_time)
);

create table if not exists public.linked_game_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id uuid not null references public.supported_games(id) on delete cascade,
  external_account_id text not null,
  external_display_name text,
  link_status public.link_status not null default 'pending',
  linked_at timestamptz not null default timezone('utc', now()),
  last_sync_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, game_id, external_account_id)
);

create table if not exists public.game_stat_snapshots (
  id uuid primary key default gen_random_uuid(),
  linked_account_id uuid not null references public.linked_game_accounts(id) on delete cascade,
  snapshot_date timestamptz not null default timezone('utc', now()),
  summary_json jsonb not null default '{}'::jsonb,
  public_visibility boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.game_stat_entries (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references public.game_stat_snapshots(id) on delete cascade,
  stat_key text not null,
  stat_label text not null,
  stat_value text not null,
  stat_type text not null default 'text',
  created_at timestamptz not null default timezone('utc', now()),
  unique (snapshot_id, stat_key)
);

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_user_id uuid not null references auth.users(id) on delete cascade,
  target_type public.follow_target_type not null,
  target_id uuid not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (follower_user_id, target_type, target_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid not null references auth.users(id) on delete cascade,
  clan_id uuid references public.clans(id) on delete cascade,
  content text not null,
  visibility public.post_visibility not null default 'public',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  sort_order integer not null default 0,
  unique (post_id, media_asset_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (post_id, user_id)
);

create table if not exists public.clan_games (
  clan_id uuid not null references public.clans(id) on delete cascade,
  game_id uuid not null references public.supported_games(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (clan_id, game_id)
);

create table if not exists public.clan_events (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  slots integer check (slots is null or slots > 0),
  game_id uuid references public.supported_games(id),
  visibility public.event_visibility not null default 'members_only',
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clan_event_attendees (
  event_id uuid not null references public.clan_events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  attendance_status public.attendance_status not null default 'going',
  checked_in_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (event_id, user_id)
);

create table if not exists public.lfg_responses (
  id uuid primary key default gen_random_uuid(),
  lfg_post_id uuid not null references public.lfg_posts(id) on delete cascade,
  responder_user_id uuid not null references auth.users(id) on delete cascade,
  status public.response_status not null default 'pending',
  message text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (lfg_post_id, responder_user_id)
);

create table if not exists public.compatibility_cache (
  id uuid primary key default gen_random_uuid(),
  source_user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'clan', 'lfg_post')),
  target_id uuid not null,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  reasons_json jsonb not null default '[]'::jsonb,
  computed_at timestamptz not null default timezone('utc', now()),
  unique (source_user_id, target_type, target_id)
);

create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  action_type public.moderation_action_type not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  event_type text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.supported_games (slug, name, cover_url, is_stats_supported, status)
values ('rawg-catalog', 'Catalogo general', null, false, 'active'::public.game_support_status)
on conflict (slug) do nothing;

insert into public.supported_games (slug, name, cover_url, is_stats_supported, status)
select
  g.slug,
  g.name,
  g.cover_url,
  g.slug in ('league-of-legends', 'teamfight-tactics', 'valorant', 'destiny-2', 'steam'),
  'active'::public.game_support_status
from public.games g
on conflict (slug) do update
set
  name = excluded.name,
  cover_url = coalesce(excluded.cover_url, public.supported_games.cover_url);

insert into public.game_api_sources (game_id, provider, auth_type, official, notes)
select sg.id, 'RAWG', 'api_key', true, 'Catalogo editorial general con atribucion.'
from public.supported_games sg
where sg.slug = 'rawg-catalog'
on conflict (game_id, provider) do nothing;

insert into public.game_api_sources (game_id, provider, auth_type, official, notes)
select sg.id, 'Riot Games API', 'api_key_registered_app', true, 'Soporte MVP aprobado para League of Legends.'
from public.supported_games sg
where sg.slug = 'league-of-legends'
on conflict (game_id, provider) do nothing;

insert into public.game_api_sources (game_id, provider, auth_type, official, notes)
select sg.id, 'Riot Games API', 'api_key_registered_app', true, 'Soporte MVP aprobado para Teamfight Tactics.'
from public.supported_games sg
where sg.slug = 'teamfight-tactics'
on conflict (game_id, provider) do nothing;

insert into public.game_api_sources (game_id, provider, auth_type, official, notes)
select sg.id, 'Riot Games API', 'api_key_registered_app', true, 'Soporte MVP aprobado para Valorant.'
from public.supported_games sg
where sg.slug = 'valorant'
on conflict (game_id, provider) do nothing;

insert into public.game_api_sources (game_id, provider, auth_type, official, notes)
select sg.id, 'Bungie.Net API', 'api_key_oauth', true, 'Soporte MVP aprobado para Destiny 2.'
from public.supported_games sg
where sg.slug = 'destiny-2'
on conflict (game_id, provider) do nothing;

insert into public.game_api_sources (game_id, provider, auth_type, official, notes)
select sg.id, 'Steam Web API', 'api_key', true, 'Soporte MVP con limites para biblioteca, horas y logros.'
from public.supported_games sg
where sg.slug = 'steam'
on conflict (game_id, provider) do nothing;

create index if not exists idx_user_app_roles_user on public.user_app_roles(user_id);
create index if not exists idx_media_assets_owner on public.media_assets(owner_user_id);
create index if not exists idx_supported_games_status on public.supported_games(status);
create index if not exists idx_game_api_sources_game on public.game_api_sources(game_id);
create index if not exists idx_profile_roles_profile on public.profile_roles(profile_id);
create index if not exists idx_profile_roles_game on public.profile_roles(game_id);
create index if not exists idx_profile_availability_profile on public.profile_availability(profile_id);
create index if not exists idx_linked_game_accounts_user on public.linked_game_accounts(user_id);
create index if not exists idx_linked_game_accounts_game on public.linked_game_accounts(game_id);
create index if not exists idx_game_stat_snapshots_linked on public.game_stat_snapshots(linked_account_id, snapshot_date desc);
create index if not exists idx_follows_target on public.follows(target_type, target_id);
create index if not exists idx_posts_author on public.posts(author_user_id, created_at desc);
create index if not exists idx_posts_clan on public.posts(clan_id, created_at desc);
create index if not exists idx_post_comments_post on public.post_comments(post_id, created_at asc);
create index if not exists idx_clan_games_game on public.clan_games(game_id);
create index if not exists idx_clan_events_clan on public.clan_events(clan_id, starts_at asc);
create index if not exists idx_lfg_responses_lfg on public.lfg_responses(lfg_post_id);
create index if not exists idx_compatibility_cache_source on public.compatibility_cache(source_user_id, computed_at desc);
create index if not exists idx_moderation_actions_admin on public.moderation_actions(admin_user_id, created_at desc);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_user_id, created_at desc);

drop trigger if exists set_supported_games_updated_at on public.supported_games;
create trigger set_supported_games_updated_at
before update on public.supported_games
for each row execute function public.set_updated_at();

drop trigger if exists set_linked_game_accounts_updated_at on public.linked_game_accounts;
create trigger set_linked_game_accounts_updated_at
before update on public.linked_game_accounts
for each row execute function public.set_updated_at();

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

drop trigger if exists set_clan_events_updated_at on public.clan_events;
create trigger set_clan_events_updated_at
before update on public.clan_events
for each row execute function public.set_updated_at();

alter table public.app_roles enable row level security;
alter table public.user_app_roles enable row level security;
alter table public.media_assets enable row level security;
alter table public.supported_games enable row level security;
alter table public.game_api_sources enable row level security;
alter table public.profile_platforms enable row level security;
alter table public.profile_roles enable row level security;
alter table public.profile_availability enable row level security;
alter table public.linked_game_accounts enable row level security;
alter table public.game_stat_snapshots enable row level security;
alter table public.game_stat_entries enable row level security;
alter table public.follows enable row level security;
alter table public.posts enable row level security;
alter table public.post_media enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_likes enable row level security;
alter table public.clan_games enable row level security;
alter table public.clan_events enable row level security;
alter table public.clan_event_attendees enable row level security;
alter table public.lfg_responses enable row level security;
alter table public.compatibility_cache enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.audit_logs enable row level security;

create policy "app roles readable by admins"
on public.app_roles for select
using (public.is_admin());

create policy "user app roles readable by self or admins"
on public.user_app_roles for select
using (user_id = auth.uid() or public.is_admin());

create policy "user app roles admin manage"
on public.user_app_roles for all
using (public.is_admin())
with check (public.is_admin());

create policy "media assets owner manage"
on public.media_assets for all
using (owner_user_id = auth.uid() or public.is_admin())
with check (owner_user_id = auth.uid() or public.is_admin());

create policy "supported games readable"
on public.supported_games for select
using (true);

create policy "supported games admin manage"
on public.supported_games for all
using (public.is_admin())
with check (public.is_admin());

create policy "game api sources readable"
on public.game_api_sources for select
using (true);

create policy "game api sources admin manage"
on public.game_api_sources for all
using (public.is_admin())
with check (public.is_admin());

create policy "profile platforms readable"
on public.profile_platforms for select
using (true);

create policy "profile platforms self manage"
on public.profile_platforms for all
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "profile roles readable"
on public.profile_roles for select
using (true);

create policy "profile roles self manage"
on public.profile_roles for all
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "profile availability readable"
on public.profile_availability for select
using (true);

create policy "profile availability self manage"
on public.profile_availability for all
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "linked game accounts self read"
on public.linked_game_accounts for select
using (user_id = auth.uid() or public.is_admin());

create policy "linked game accounts self manage"
on public.linked_game_accounts for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "stat snapshots visible through linked account"
on public.game_stat_snapshots for select
using (
  exists (
    select 1
    from public.linked_game_accounts lga
    where lga.id = linked_account_id
      and (lga.user_id = auth.uid() or public.is_admin() or public_visibility)
  )
);

create policy "stat snapshots owner manage"
on public.game_stat_snapshots for all
using (
  exists (
    select 1
    from public.linked_game_accounts lga
    where lga.id = linked_account_id
      and (lga.user_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1
    from public.linked_game_accounts lga
    where lga.id = linked_account_id
      and (lga.user_id = auth.uid() or public.is_admin())
  )
);

create policy "stat entries visible through snapshot"
on public.game_stat_entries for select
using (
  exists (
    select 1
    from public.game_stat_snapshots gss
    join public.linked_game_accounts lga on lga.id = gss.linked_account_id
    where gss.id = snapshot_id
      and (lga.user_id = auth.uid() or public.is_admin() or gss.public_visibility)
  )
);

create policy "stat entries owner manage"
on public.game_stat_entries for all
using (
  exists (
    select 1
    from public.game_stat_snapshots gss
    join public.linked_game_accounts lga on lga.id = gss.linked_account_id
    where gss.id = snapshot_id
      and (lga.user_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1
    from public.game_stat_snapshots gss
    join public.linked_game_accounts lga on lga.id = gss.linked_account_id
    where gss.id = snapshot_id
      and (lga.user_id = auth.uid() or public.is_admin())
  )
);

create policy "follows self read"
on public.follows for select
using (follower_user_id = auth.uid() or public.is_admin());

create policy "follows self manage"
on public.follows for all
using (follower_user_id = auth.uid() or public.is_admin())
with check (follower_user_id = auth.uid() or public.is_admin());

create policy "posts readable"
on public.posts for select
using (
  visibility = 'public'
  or author_user_id = auth.uid()
  or public.is_admin()
  or (
    visibility = 'clan'
    and clan_id is not null
    and exists (
      select 1
      from public.clan_members cm
      where cm.clan_id = posts.clan_id
        and cm.profile_id = public.current_profile_id()
    )
  )
);

create policy "posts owner manage"
on public.posts for all
using (
  author_user_id = auth.uid()
  or public.is_admin()
  or (
    clan_id is not null
    and public.is_clan_manager(clan_id)
  )
)
with check (
  author_user_id = auth.uid()
  or public.is_admin()
  or (
    clan_id is not null
    and public.is_clan_manager(clan_id)
  )
);

create policy "post media visible through post"
on public.post_media for select
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_id
  )
);

create policy "post media owner manage"
on public.post_media for all
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_id
      and (p.author_user_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1
    from public.posts p
    where p.id = post_id
      and (p.author_user_id = auth.uid() or public.is_admin())
  )
);

create policy "post comments readable"
on public.post_comments for select
using (true);

create policy "post comments self manage"
on public.post_comments for all
using (author_user_id = auth.uid() or public.is_admin())
with check (author_user_id = auth.uid() or public.is_admin());

create policy "post likes readable"
on public.post_likes for select
using (true);

create policy "post likes self manage"
on public.post_likes for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "clan games readable"
on public.clan_games for select
using (true);

create policy "clan games clan manager manage"
on public.clan_games for all
using (public.is_clan_manager(clan_id) or public.is_admin())
with check (public.is_clan_manager(clan_id) or public.is_admin());

create policy "clan events readable"
on public.clan_events for select
using (
  visibility = 'public'
  or public.is_admin()
  or exists (
    select 1
    from public.clan_members cm
    where cm.clan_id = clan_events.clan_id
      and cm.profile_id = public.current_profile_id()
  )
);

create policy "clan events manager manage"
on public.clan_events for all
using (
  public.is_admin()
  or exists (
    select 1
    from public.clans c
    where c.id = clan_events.clan_id
      and (
        c.leader_profile_id = public.current_profile_id()
        or exists (
          select 1
          from public.clan_members cm
          where cm.clan_id = c.id
            and cm.profile_id = public.current_profile_id()
            and cm.role_code in ('leader', 'officer')
        )
      )
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.clans c
    where c.id = clan_events.clan_id
      and (
        c.leader_profile_id = public.current_profile_id()
        or exists (
          select 1
          from public.clan_members cm
          where cm.clan_id = c.id
            and cm.profile_id = public.current_profile_id()
            and cm.role_code in ('leader', 'officer')
        )
      )
  )
);

create policy "clan event attendees readable"
on public.clan_event_attendees for select
using (true);

create policy "clan event attendees self manage"
on public.clan_event_attendees for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "lfg responses visible to parties"
on public.lfg_responses for select
using (
  responder_user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.lfg_posts lp
    join public.profiles p on p.id = lp.profile_id
    where lp.id = lfg_post_id
      and p.user_id = auth.uid()
  )
);

create policy "lfg responses self manage"
on public.lfg_responses for all
using (responder_user_id = auth.uid() or public.is_admin())
with check (responder_user_id = auth.uid() or public.is_admin());

create policy "compatibility cache self read"
on public.compatibility_cache for select
using (source_user_id = auth.uid() or public.is_admin());

create policy "compatibility cache self manage"
on public.compatibility_cache for all
using (source_user_id = auth.uid() or public.is_admin())
with check (source_user_id = auth.uid() or public.is_admin());

create policy "moderation actions admin only"
on public.moderation_actions for all
using (public.is_admin())
with check (public.is_admin());

create policy "audit logs admin only"
on public.audit_logs for all
using (public.is_admin())
with check (public.is_admin());
