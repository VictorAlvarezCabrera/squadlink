create extension if not exists pgcrypto;

create type public.app_role as enum ('player', 'leader', 'admin');
create type public.clan_visibility as enum ('public', 'private');
create type public.event_visibility as enum ('public', 'members_only');
create type public.request_status as enum ('pending', 'approved', 'rejected', 'cancelled');
create type public.attendance_status as enum ('going', 'maybe', 'declined');
create type public.lfg_status as enum ('active', 'expired', 'closed');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');
create type public.review_kind as enum ('player', 'clan');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  genre text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.platforms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  role public.app_role not null default 'player',
  nick text not null unique,
  full_name text not null,
  avatar_url text,
  bio text not null default '',
  timezone text not null default 'Europe/Madrid',
  main_platform_id uuid references public.platforms(id),
  reliability_score integer not null default 75 check (reliability_score between 0 and 100),
  is_public boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.current_profile_id()
returns uuid
language sql
stable
as $$
  select id from public.profiles where user_id = auth.uid() limit 1
$$;

create table if not exists public.profile_languages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  language_code text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, language_code)
);

create table if not exists public.profile_games (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  is_favorite boolean not null default false,
  gameplay_roles text[] not null default '{}',
  created_at timestamptz not null default timezone('utc', now()),
  unique (profile_id, game_id)
);

create table if not exists public.user_availability (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  week_day smallint not null check (week_day between 1 and 7),
  starts_at time not null,
  ends_at time not null,
  created_at timestamptz not null default timezone('utc', now()),
  check (ends_at > starts_at)
);

create table if not exists public.clans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  tagline text not null,
  description text not null,
  game_id uuid not null references public.games(id),
  leader_profile_id uuid not null references public.profiles(id),
  visibility public.clan_visibility not null default 'public',
  playstyle text not null check (playstyle in ('casual', 'ranked', 'competitive', 'mixed')),
  schedule_summary text not null,
  member_capacity integer check (member_capacity is null or member_capacity > 1),
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.clan_platforms (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  platform_id uuid not null references public.platforms(id) on delete cascade,
  unique (clan_id, platform_id)
);

create table if not exists public.clan_languages (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  language_code text not null,
  unique (clan_id, language_code)
);

create table if not exists public.clan_roles (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  code text not null,
  label text not null,
  unique (clan_id, code)
);

create table if not exists public.clan_members (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_code text not null default 'member',
  joined_at timestamptz not null default timezone('utc', now()),
  unique (clan_id, profile_id)
);

create table if not exists public.clan_join_requests (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (clan_id, profile_id, status)
);

create table if not exists public.clan_invitations (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  invited_by_profile_id uuid not null references public.profiles(id),
  message text,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  clan_id uuid not null references public.clans(id) on delete cascade,
  game_id uuid not null references public.games(id),
  title text not null,
  description text not null,
  starts_at timestamptz not null,
  capacity integer not null check (capacity > 1),
  visibility public.event_visibility not null default 'members_only',
  created_by_profile_id uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.attendance_status not null default 'going',
  created_at timestamptz not null default timezone('utc', now()),
  unique (event_id, profile_id)
);

create table if not exists public.lfg_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  game_id uuid not null references public.games(id),
  title text not null,
  description text not null,
  desired_roles text[] not null default '{}',
  expires_at timestamptz not null,
  status public.lfg_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.lfg_platforms (
  id uuid primary key default gen_random_uuid(),
  lfg_post_id uuid not null references public.lfg_posts(id) on delete cascade,
  platform_id uuid not null references public.platforms(id) on delete cascade,
  unique (lfg_post_id, platform_id)
);

create table if not exists public.lfg_languages (
  id uuid primary key default gen_random_uuid(),
  lfg_post_id uuid not null references public.lfg_posts(id) on delete cascade,
  language_code text not null,
  unique (lfg_post_id, language_code)
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_profile_id uuid not null references public.profiles(id) on delete cascade,
  kind public.review_kind not null default 'player',
  score integer not null check (score between 1 and 5),
  comment text not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (author_profile_id, target_profile_id, kind)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_profile_id uuid not null references public.profiles(id) on delete cascade,
  target_type text not null check (target_type in ('profile', 'clan', 'lfg_post')),
  target_id uuid not null,
  reason text not null,
  details text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profile_games_game on public.profile_games(game_id);
create index if not exists idx_clans_game on public.clans(game_id);
create index if not exists idx_clans_leader on public.clans(leader_profile_id);
create index if not exists idx_clan_members_profile on public.clan_members(profile_id);
create index if not exists idx_clan_requests_clan_status on public.clan_join_requests(clan_id, status);
create index if not exists idx_events_starts_at on public.events(starts_at);
create index if not exists idx_event_attendees_profile on public.event_attendees(profile_id);
create index if not exists idx_lfg_posts_game_status on public.lfg_posts(game_id, status);
create index if not exists idx_reports_status on public.reports(status);
create index if not exists idx_notifications_profile_read on public.notifications(profile_id, is_read);

create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_clans_updated_at before update on public.clans for each row execute function public.set_updated_at();
create trigger set_requests_updated_at before update on public.clan_join_requests for each row execute function public.set_updated_at();
create trigger set_invitations_updated_at before update on public.clan_invitations for each row execute function public.set_updated_at();
create trigger set_events_updated_at before update on public.events for each row execute function public.set_updated_at();
create trigger set_lfg_updated_at before update on public.lfg_posts for each row execute function public.set_updated_at();
create trigger set_reports_updated_at before update on public.reports for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.profile_games enable row level security;
alter table public.profile_languages enable row level security;
alter table public.user_availability enable row level security;
alter table public.clans enable row level security;
alter table public.clan_members enable row level security;
alter table public.clan_join_requests enable row level security;
alter table public.clan_invitations enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.lfg_posts enable row level security;
alter table public.lfg_platforms enable row level security;
alter table public.lfg_languages enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;

create policy "profiles are public readable"
on public.profiles for select
using (is_public or user_id = auth.uid());

create policy "profiles self manage"
on public.profiles for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "profile games readable"
on public.profile_games for select
using (true);

create policy "profile games self manage"
on public.profile_games for all
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "profile languages readable"
on public.profile_languages for select
using (true);

create policy "profile languages self manage"
on public.profile_languages for all
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "availability readable"
on public.user_availability for select
using (true);

create policy "availability self manage"
on public.user_availability for all
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "public clans readable"
on public.clans for select
using (visibility = 'public' or leader_profile_id = public.current_profile_id());

create policy "leaders manage own clans"
on public.clans for all
using (leader_profile_id = public.current_profile_id())
with check (leader_profile_id = public.current_profile_id());

create policy "memberships readable"
on public.clan_members for select
using (true);

create policy "leaders manage memberships"
on public.clan_members for all
using (
  exists (
    select 1 from public.clans c
    where c.id = clan_members.clan_id
      and c.leader_profile_id = public.current_profile_id()
  )
)
with check (
  exists (
    select 1 from public.clans c
    where c.id = clan_members.clan_id
      and c.leader_profile_id = public.current_profile_id()
  )
);

create policy "requests readable by applicant or leader"
on public.clan_join_requests for select
using (
  profile_id = public.current_profile_id()
  or exists (
    select 1 from public.clans c
    where c.id = clan_join_requests.clan_id
      and c.leader_profile_id = public.current_profile_id()
  )
);

create policy "players create own requests"
on public.clan_join_requests for insert
with check (profile_id = public.current_profile_id());

create policy "leaders update requests"
on public.clan_join_requests for update
using (
  exists (
    select 1 from public.clans c
    where c.id = clan_join_requests.clan_id
      and c.leader_profile_id = public.current_profile_id()
  )
);

create policy "invitations visible to parties"
on public.clan_invitations for select
using (
  profile_id = public.current_profile_id()
  or invited_by_profile_id = public.current_profile_id()
);

create policy "leaders manage invitations"
on public.clan_invitations for all
using (invited_by_profile_id = public.current_profile_id())
with check (invited_by_profile_id = public.current_profile_id());

create policy "events readable"
on public.events for select
using (
  visibility = 'public'
  or exists (
    select 1 from public.clan_members cm
    where cm.clan_id = events.clan_id
      and cm.profile_id = public.current_profile_id()
  )
);

create policy "leaders create events"
on public.events for all
using (created_by_profile_id = public.current_profile_id())
with check (created_by_profile_id = public.current_profile_id());

create policy "event attendees readable"
on public.event_attendees for select
using (true);

create policy "event attendees self manage"
on public.event_attendees for all
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "lfg readable"
on public.lfg_posts for select
using (status = 'active' or profile_id = public.current_profile_id());

create policy "lfg self manage"
on public.lfg_posts for all
using (profile_id = public.current_profile_id())
with check (profile_id = public.current_profile_id());

create policy "lfg platforms readable"
on public.lfg_platforms for select
using (true);

create policy "lfg languages readable"
on public.lfg_languages for select
using (true);

create policy "reviews readable"
on public.reviews for select
using (true);

create policy "reviews self create"
on public.reviews for insert
with check (author_profile_id = public.current_profile_id());

create policy "reports self create"
on public.reports for insert
with check (reporter_profile_id = public.current_profile_id());

create policy "reports visible to reporter"
on public.reports for select
using (reporter_profile_id = public.current_profile_id());

create policy "notifications self read"
on public.notifications for select
using (profile_id = public.current_profile_id());

create policy "notifications self update"
on public.notifications for update
using (profile_id = public.current_profile_id());
