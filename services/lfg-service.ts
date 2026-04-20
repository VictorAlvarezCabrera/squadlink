import { games as demoGames, lfgPosts as demoLfgPosts, profiles as demoProfiles } from "@/data/demo";
import { AppError } from "@/lib/app-error";
import { createServerBackendClient } from "@/lib/backend/server";
import type { PlatformCode } from "@/types/domain";

import {
  LfgLanguageRow,
  LfgPlatformRow,
  LfgPostRow,
  ensureAuthedUser,
  ensureBootstrapProfile,
  getCatalogRows,
  getProfileById,
  isDemoMode,
} from "@/services/_shared";

export interface LfgInput {
  gameId: string;
  title: string;
  description: string;
  platforms: PlatformCode[];
  desiredRoles: string[];
  languages: string[];
  expiresAt: string;
}

export async function listLfgPosts() {
  if (isDemoMode) {
    return demoLfgPosts.map((post) => ({
      ...post,
      profile: demoProfiles.find((profile) => profile.id === post.profileId)!,
      game: demoGames.find((game) => game.id === post.gameId)!,
    }));
  }

  const supabase = await createServerBackendClient();
  const [{ data: lfgRows }, { data: lfgPlatforms }, { data: lfgLanguages }, catalog] = await Promise.all([
    supabase!.from("lfg_posts").select("*").returns<LfgPostRow[]>(),
    supabase!.from("lfg_platforms").select("*").returns<LfgPlatformRow[]>(),
    supabase!.from("lfg_languages").select("*").returns<LfgLanguageRow[]>(),
    getCatalogRows(),
  ]);

  return Promise.all(
    (lfgRows ?? []).map(async (row) => ({
      id: row.id,
      profileId: row.profile_id,
      gameId: row.game_id,
      title: row.title,
      description: row.description,
      platforms: (lfgPlatforms ?? [])
        .filter((entry) => entry.lfg_post_id === row.id)
        .map((entry) => catalog?.platforms.find((platform) => platform.id === entry.platform_id)?.code)
        .filter((code): code is PlatformCode => Boolean(code)),
      desiredRoles: row.desired_roles,
      languages: (lfgLanguages ?? []).filter((entry) => entry.lfg_post_id === row.id).map((entry) => entry.language_code),
      expiresAt: row.expires_at,
      status: row.status,
      profile: await getProfileById(row.profile_id),
      game: (catalog?.games ?? demoGames).find((game) => game.id === row.game_id)!,
    }))
  );
}

export async function createLfgPost(input: LfgInput) {
  const viewer = await ensureBootstrapProfile();

  if (isDemoMode) {
    return {
      ...demoLfgPosts[0]!,
      id: `demo-lfg-${Date.now()}`,
      profileId: viewer.id,
      gameId: input.gameId,
      title: input.title,
      description: input.description,
      platforms: input.platforms,
      desiredRoles: input.desiredRoles,
      languages: input.languages,
      expiresAt: input.expiresAt,
      status: "active" as const,
    };
  }

  const authed = await ensureAuthedUser();
  const catalog = await getCatalogRows();
  const { data, error } = await authed.supabase
    .from("lfg_posts")
    .insert({
      profile_id: viewer.id,
      game_id: input.gameId,
      title: input.title,
      description: input.description,
      desired_roles: input.desiredRoles,
      expires_at: input.expiresAt,
      status: "active",
    })
    .select("*")
    .single<LfgPostRow>();

  if (error || !data) {
    throw new AppError(error?.message ?? "No se pudo crear el LFG.", 400);
  }

  if (input.languages.length) {
    await authed.supabase.from("lfg_languages").insert(input.languages.map((language) => ({ lfg_post_id: data.id, language_code: language })));
  }

  if (input.platforms.length) {
    await authed.supabase.from("lfg_platforms").insert(
      input.platforms
        .map((code) => catalog?.platforms.find((platform) => platform.code === code)?.id)
        .filter((id): id is string => Boolean(id))
        .map((platformId) => ({ lfg_post_id: data.id, platform_id: platformId }))
    );
  }

  return data;
}

export async function updateLfgPost(postId: string, input: LfgInput) {
  const viewer = await ensureBootstrapProfile();
  const current = (await listLfgPosts()).find((post) => post.id === postId);

  if (!current) {
    throw new AppError("LFG no encontrado.", 404);
  }

  if (current.profileId !== viewer.id && viewer.role !== "admin") {
    throw new AppError("No puedes editar este LFG.", 403);
  }

  if (isDemoMode) {
    return { ...current, ...input };
  }

  const authed = await ensureAuthedUser();
  const catalog = await getCatalogRows();

  await authed.supabase
    .from("lfg_posts")
    .update({
      game_id: input.gameId,
      title: input.title,
      description: input.description,
      desired_roles: input.desiredRoles,
      expires_at: input.expiresAt,
    })
    .eq("id", postId);

  await Promise.all([
    authed.supabase.from("lfg_languages").delete().eq("lfg_post_id", postId),
    authed.supabase.from("lfg_platforms").delete().eq("lfg_post_id", postId),
  ]);

  if (input.languages.length) {
    await authed.supabase.from("lfg_languages").insert(input.languages.map((language) => ({ lfg_post_id: postId, language_code: language })));
  }

  if (input.platforms.length) {
    await authed.supabase.from("lfg_platforms").insert(
      input.platforms
        .map((code) => catalog?.platforms.find((platform) => platform.code === code)?.id)
        .filter((id): id is string => Boolean(id))
        .map((platformId) => ({ lfg_post_id: postId, platform_id: platformId }))
    );
  }

  return (await listLfgPosts()).find((post) => post.id === postId) ?? null;
}

export async function closeLfgPost(postId: string) {
  const viewer = await ensureBootstrapProfile();
  const current = (await listLfgPosts()).find((post) => post.id === postId);

  if (!current) {
    throw new AppError("LFG no encontrado.", 404);
  }

  if (current.profileId !== viewer.id && viewer.role !== "admin") {
    throw new AppError("No puedes cerrar este LFG.", 403);
  }

  if (isDemoMode) {
    return { ...current, status: "closed" as const };
  }

  const authed = await ensureAuthedUser();
  await authed.supabase.from("lfg_posts").update({ status: "closed" }).eq("id", postId);
  return (await listLfgPosts()).find((post) => post.id === postId) ?? null;
}
