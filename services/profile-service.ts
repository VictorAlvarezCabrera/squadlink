import { profiles as demoProfiles } from "@/data/demo";
import { AppError } from "@/lib/app-error";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile, PlatformCode } from "@/types/domain";

import {
  ProfileRow,
  ensureAuthedUser,
  ensureBootstrapProfile,
  getCatalogRows,
  getProfileByRow,
  isDemoMode,
} from "@/services/_shared";

export interface ProfileUpdateInput {
  nick: string;
  fullName: string;
  bio: string;
  avatarUrl?: string;
  mainPlatform: PlatformCode;
  languages: string[];
  favoriteGameIds: string[];
  gameplayRoles: string[];
  reliabilityScore: number;
  timezone: string;
  availability: Profile["availability"];
}

export async function getProfileByUserId(userId: string, email = "") {
  if (isDemoMode) {
    return demoProfiles.find((profile) => profile.authUserId === userId || profile.email === email) ?? null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  return profileRow ? getProfileByRow(profileRow, email) : null;
}

export async function bootstrapProfile(input?: {
  userId?: string;
  email?: string;
  userMetadata?: Record<string, unknown> | null;
}) {
  if (isDemoMode) {
    return ensureBootstrapProfile();
  }

  const admin = createAdminSupabaseClient();
  if (input?.userId && admin) {
    const { error } = await admin.rpc("ensure_profile_for_user", {
      target_user_id: input.userId,
      target_email: input.email ?? `${input.userId}@local.invalid`,
      target_meta: input.userMetadata ?? {},
    });

    if (error) {
      throw new AppError(error.message, 500);
    }

    const { data: profileRow } = await admin.from("profiles").select("*").eq("user_id", input.userId).maybeSingle<ProfileRow>();
    if (!profileRow) {
      throw new AppError("No se pudo crear o recuperar el perfil.", 500);
    }

    return getProfileByRow(profileRow, input.email ?? "");
  }

  const authed = await ensureAuthedUser();
  const userId = input?.userId ?? authed.user.id;
  const email = input?.email ?? authed.user.email ?? `${authed.user.id}@local.invalid`;
  const userMetadata = input?.userMetadata ?? authed.user.user_metadata ?? {};

  if (admin) {
    const { error } = await admin.rpc("ensure_profile_for_user", {
      target_user_id: userId,
      target_email: email,
      target_meta: userMetadata,
    });

    if (error) {
      throw new AppError(error.message, 500);
    }
  }

  const profile = await getProfileByUserId(userId, email);
  if (!profile) {
    throw new AppError("No se pudo crear o recuperar el perfil.", 500);
  }

  return profile;
}

export async function getViewerProfile() {
  if (isDemoMode) {
    return ensureBootstrapProfile();
  }

  const authed = await ensureAuthedUser();
  const profile = await getProfileByUserId(authed.user.id, authed.user.email ?? "");
  return profile ?? bootstrapProfile();
}

export async function getProfileByNick(nick: string) {
  if (isDemoMode) {
    return demoProfiles.find((profile) => profile.nick.toLowerCase() === nick.toLowerCase()) ?? null;
  }

  const supabase = await createServerSupabaseClient();
  const { data: profileRow } = await supabase!
    .from("profiles")
    .select("*")
    .ilike("nick", nick)
    .maybeSingle<ProfileRow>();

  return profileRow ? getProfileByRow(profileRow, "") : null;
}

export async function updateMyProfile(input: ProfileUpdateInput) {
  if (isDemoMode) {
    return {
      ...demoProfiles[0]!,
      nick: input.nick,
      fullName: input.fullName,
      bio: input.bio,
      languages: input.languages,
      mainPlatform: input.mainPlatform,
      favoriteGameIds: input.favoriteGameIds,
      gameplayRoles: input.gameplayRoles,
      reliabilityScore: input.reliabilityScore,
      timezone: input.timezone,
      availability: input.availability,
    };
  }

  const authed = await ensureAuthedUser();
  const profile = await getViewerProfile();
  if (!profile) {
    throw new AppError("Perfil no disponible.", 404);
  }

  const catalog = await getCatalogRows();
  const mainPlatformId = catalog?.platforms.find((platform) => platform.code === input.mainPlatform)?.id ?? null;

  const { error } = await authed.supabase
    .from("profiles")
    .update({
      nick: input.nick,
      full_name: input.fullName,
      bio: input.bio,
      avatar_url: input.avatarUrl ?? null,
      main_platform_id: mainPlatformId,
      reliability_score: input.reliabilityScore,
      timezone: input.timezone,
    })
    .eq("id", profile.id);

  if (error) {
    throw new AppError(error.message, 400);
  }

  await Promise.all([
    authed.supabase.from("profile_languages").delete().eq("profile_id", profile.id),
    authed.supabase.from("profile_games").delete().eq("profile_id", profile.id),
    authed.supabase.from("user_availability").delete().eq("profile_id", profile.id),
  ]);

  if (input.languages.length) {
    await authed.supabase.from("profile_languages").insert(
      input.languages.map((language) => ({
        profile_id: profile.id,
        language_code: language,
      }))
    );
  }

  if (input.favoriteGameIds.length) {
    await authed.supabase.from("profile_games").insert(
      input.favoriteGameIds.map((gameId) => ({
        profile_id: profile.id,
        game_id: gameId,
        is_favorite: true,
        gameplay_roles: input.gameplayRoles,
      }))
    );
  }

  if (input.availability.length) {
    await authed.supabase.from("user_availability").insert(
      input.availability.map((slot) => ({
        profile_id: profile.id,
        week_day: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].indexOf(slot.day) + 1,
        starts_at: slot.from,
        ends_at: slot.to,
      }))
    );
  }

  return getViewerProfile();
}
