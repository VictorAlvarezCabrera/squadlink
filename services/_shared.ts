import {
  authFixtures,
  games as demoGames,
  platforms as demoPlatforms,
  profiles as demoProfiles,
} from "@/data/demo";
import { AppError } from "@/lib/app-error";
import { isDemoMode } from "@/lib/env";
import { createAdminBackendClient } from "@/lib/backend/admin";
import { createServerBackendClient } from "@/lib/backend/server";
import type { Clan, Game, LfgPost, Platform, PlatformCode, Profile } from "@/types/domain";

export interface ProfileRow {
  id: string;
  user_id: string;
  role: Profile["role"];
  nick: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  timezone: string;
  reliability_score: number;
  is_public: boolean;
  main_platform_id: string | null;
}

export interface ProfileLanguageRow {
  profile_id: string;
  language_code: string;
}

export interface ProfileGameRow {
  profile_id: string;
  game_id: string;
  is_favorite: boolean;
  gameplay_roles: string[];
}

export interface AvailabilityRow {
  profile_id: string;
  week_day: number;
  starts_at: string;
  ends_at: string;
}

export interface PlatformRow {
  id: string;
  code: PlatformCode;
  name: string;
}

export interface GameRow {
  id: string;
  name: string;
  slug: string;
  genre: string;
  rawg_id: number | null;
  cover_url: string | null;
  background_image: string | null;
  released_at: string | null;
  last_synced_at: string | null;
}

export interface ClanRow {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  game_id: string;
  leader_profile_id: string;
  visibility: Clan["visibility"];
  playstyle: Clan["playstyle"];
  schedule_summary: string;
  requirements: string[];
}

export interface ClanPlatformRow {
  clan_id: string;
  platform_id: string;
}

export interface ClanLanguageRow {
  clan_id: string;
  language_code: string;
}

export interface ClanRoleRow {
  clan_id: string;
  code: string;
  label: string;
}

export interface ClanMemberRow {
  id: string;
  clan_id: string;
  profile_id: string;
  role_code: "leader" | "officer" | "member";
  joined_at: string;
}

export interface ClanJoinRequestRow {
  id: string;
  clan_id: string;
  profile_id: string;
  message: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  created_at: string;
}

export interface EventRow {
  id: string;
  clan_id: string;
  game_id: string;
  title: string;
  description: string;
  starts_at: string;
  capacity: number;
  visibility: "public" | "members_only";
  created_by_profile_id: string;
}

export interface EventAttendeeRow {
  id: string;
  event_id: string;
  profile_id: string;
  status: "going" | "maybe" | "declined";
}

export interface LfgPostRow {
  id: string;
  profile_id: string;
  game_id: string;
  title: string;
  description: string;
  desired_roles: string[];
  expires_at: string;
  status: LfgPost["status"];
}

export interface LfgPlatformRow {
  lfg_post_id: string;
  platform_id: string;
}

export interface LfgLanguageRow {
  lfg_post_id: string;
  language_code: string;
}

export interface ReportRow {
  id: string;
  reporter_profile_id: string;
  target_type: "profile" | "clan" | "lfg_post";
  target_id: string;
  reason: string;
  details: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  created_at: string;
}

export interface NotificationRow {
  id: string;
  profile_id: string;
  title: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function dayCodeFromNumber(day: number): Profile["availability"][number]["day"] {
  return (["mon", "tue", "wed", "thu", "fri", "sat", "sun"][day - 1] ?? "mon") as Profile["availability"][number]["day"];
}

export function getDemoViewerProfile() {
  const fixture = authFixtures[0];
  return fixture ? demoProfiles.find((profile) => profile.id === fixture.profileId) ?? demoProfiles[0]! : demoProfiles[0]!;
}

export async function getCatalogRows() {
  const supabase = await createServerBackendClient();
  if (!supabase) {
    return null;
  }

  const [{ data: games }, { data: platforms }] = await Promise.all([
    supabase.from("games").select("*").returns<GameRow[]>(),
    supabase.from("platforms").select("*").returns<PlatformRow[]>(),
  ]);

  return { games: games ?? [], platforms: platforms ?? [] };
}

export async function getAuthedContext() {
  const supabase = await createServerBackendClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new AppError(error.message, 401);
  }

  return { supabase, user };
}

export async function ensureAuthedUser() {
  const authed = await getAuthedContext();
  if (!authed?.user) {
    throw new AppError("Debes iniciar sesión.", 401);
  }

  return {
    supabase: authed.supabase,
    user: authed.user,
  };
}

export async function ensureBootstrapProfile() {
  if (isDemoMode) {
    return getDemoViewerProfile();
  }

  const authed = await ensureAuthedUser();
  const user = authed.user;
  const admin = createAdminBackendClient();

  if (admin) {
    await admin.rpc("ensure_profile_for_user", {
      target_user_id: user.id,
      target_email: user.email ?? `${user.id}@local.invalid`,
      target_meta: user.user_metadata ?? {},
    });
  }

  const { data: profileRow } = await authed.supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (!profileRow) {
    throw new AppError("No se pudo crear o cargar el perfil.", 500);
  }

  return getProfileByRow(profileRow, user.email ?? "");
}

export async function getProfileByRow(row: ProfileRow, email: string) {
  const supabase = await createServerBackendClient();
  const [{ data: profileLanguages }, { data: profileGames }, { data: availability }, catalog] = await Promise.all([
    supabase!.from("profile_languages").select("*").eq("profile_id", row.id).returns<ProfileLanguageRow[]>(),
    supabase!.from("profile_games").select("*").eq("profile_id", row.id).returns<ProfileGameRow[]>(),
    supabase!.from("user_availability").select("*").eq("profile_id", row.id).returns<AvailabilityRow[]>(),
    getCatalogRows(),
  ]);

  const mainPlatform = catalog?.platforms.find((platform) => platform.id === row.main_platform_id)?.code ?? "pc";

  return {
    id: row.id,
    authUserId: row.user_id,
    nick: row.nick,
    fullName: row.full_name,
    email,
    role: row.role,
    avatarUrl: row.avatar_url ?? "/avatars/default.svg",
    bio: row.bio,
    languages: (profileLanguages ?? []).map((language) => language.language_code),
    mainPlatform,
    favoriteGameIds: (profileGames ?? []).filter((game) => game.is_favorite).map((game) => game.game_id),
    gameplayRoles: [...new Set((profileGames ?? []).flatMap((game) => game.gameplay_roles))],
    reliabilityScore: row.reliability_score,
    timezone: row.timezone,
    availability: (availability ?? []).map((slot) => ({
      day: dayCodeFromNumber(slot.week_day),
      from: slot.starts_at.slice(0, 5),
      to: slot.ends_at.slice(0, 5),
    })),
  } satisfies Profile;
}

export function mapGame(row: GameRow): Game {
  return { id: row.id, name: row.name, slug: row.slug, genre: row.genre, roles: [] };
}

export function mapPlatform(row: PlatformRow): Platform {
  return row;
}

export async function getProfileById(profileId: string) {
  if (isDemoMode) {
    const profile = demoProfiles.find((entry) => entry.id === profileId);
    if (!profile) {
      throw new AppError("Perfil no encontrado.", 404);
    }

    return profile;
  }

  const supabase = await createServerBackendClient();
  const { data: profileRow } = await supabase!.from("profiles").select("*").eq("id", profileId).maybeSingle<ProfileRow>();

  if (!profileRow) {
    throw new AppError("Perfil no encontrado.", 404);
  }

  return getProfileByRow(profileRow, "");
}

export async function assertAdmin() {
  const profile = await ensureBootstrapProfile();
  if (profile.role !== "admin") {
    throw new AppError("Permisos insuficientes.", 403);
  }

  return profile;
}

export async function insertNotification(profileId: string, title: string, body: string) {
  if (isDemoMode) {
    return;
  }

  const supabase = await createServerBackendClient();
  await supabase!.from("notifications").insert({ profile_id: profileId, title, body });
}

export const demoCatalog = { games: demoGames, platforms: demoPlatforms };
export const demoData = { profiles: demoProfiles };
export { createAdminBackendClient, isDemoMode };
