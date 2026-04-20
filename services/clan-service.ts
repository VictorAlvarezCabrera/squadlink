import { createHash } from "node:crypto";

import {
  clanJoinRequests as demoClanJoinRequests,
  clanMembers as demoClanMembers,
  clans as demoClans,
  profiles as demoProfiles,
} from "@/data/demo";
import { AppError } from "@/lib/app-error";
import type { Clan, PlatformCode } from "@/types/domain";

import {
  ClanJoinRequestRow,
  ClanLanguageRow,
  ClanMemberRow,
  ClanPlatformRow,
  ClanRoleRow,
  ClanRow,
  ensureAuthedUser,
  ensureBootstrapProfile,
  getCatalogRows,
  getProfileById,
  insertNotification,
  isDemoMode,
  slugify,
} from "@/services/_shared";
import { createServerBackendClient } from "@/lib/backend/server";

export interface ClanInput {
  name: string;
  tagline: string;
  description: string;
  visibility: Clan["visibility"];
  gameId: string;
  preferredPlatforms: PlatformCode[];
  languages: string[];
  playstyle: Clan["playstyle"];
  scheduleSummary: string;
  requirements: string[];
  openRoles: string[];
}

function mapClan(
  row: ClanRow,
  clanPlatforms: ClanPlatformRow[],
  clanLanguages: ClanLanguageRow[],
  clanRoles: ClanRoleRow[],
  platformRows: Array<{ id: string; code: PlatformCode; name: string }>,
  memberCount: number
): Clan {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    gameId: row.game_id,
    preferredPlatforms: clanPlatforms
      .filter((entry) => entry.clan_id === row.id)
      .map((entry) => platformRows.find((platform) => platform.id === entry.platform_id)?.code)
      .filter((code): code is PlatformCode => Boolean(code)),
    languages: clanLanguages.filter((entry) => entry.clan_id === row.id).map((entry) => entry.language_code),
    playstyle: row.playstyle,
    visibility: row.visibility,
    scheduleSummary: row.schedule_summary,
    requirements: row.requirements,
    leaderProfileId: row.leader_profile_id,
    memberCount,
    openRoles: clanRoles.filter((entry) => entry.clan_id === row.id).map((entry) => entry.code),
  };
}

export async function listClans() {
  if (isDemoMode) {
    return demoClans;
  }

  const supabase = await createServerBackendClient();
  const [catalog, { data: clanRows }, { data: clanPlatforms }, { data: clanLanguages }, { data: clanRoles }, { data: clanMembers }] =
    await Promise.all([
      getCatalogRows(),
      supabase!.from("clans").select("*").is("deleted_at", null).returns<ClanRow[]>(),
      supabase!.from("clan_platforms").select("*").returns<ClanPlatformRow[]>(),
      supabase!.from("clan_languages").select("*").returns<ClanLanguageRow[]>(),
      supabase!.from("clan_roles").select("*").returns<ClanRoleRow[]>(),
      supabase!.from("clan_members").select("*").returns<ClanMemberRow[]>(),
    ]);

  return (clanRows ?? []).map((row) =>
    mapClan(
      row,
      clanPlatforms ?? [],
      clanLanguages ?? [],
      clanRoles ?? [],
      catalog?.platforms ?? [],
      (clanMembers ?? []).filter((member) => member.clan_id === row.id).length
    )
  );
}

export async function listFeaturedClans() {
  return (await listClans()).slice(0, 3);
}

export async function getClanBySlug(slug: string) {
  const clans = await listClans();
  return clans.find((clan) => clan.slug === slug) ?? null;
}

export async function listClanMembers(clanId: string) {
  if (isDemoMode) {
    return demoClanMembers
      .filter((member) => member.clanId === clanId)
      .map((member) => ({
        ...member,
        profile: demoProfiles.find((profile) => profile.id === member.profileId)!,
      }));
  }

  const authed = await ensureAuthedUser();
  const { data: memberRows } = await authed.supabase
    .from("clan_members")
    .select("*")
    .eq("clan_id", clanId)
    .returns<ClanMemberRow[]>();

  return Promise.all(
    (memberRows ?? []).map(async (member) => ({
      id: member.id,
      clanId: member.clan_id,
      profileId: member.profile_id,
      role: member.role_code,
      joinedAt: member.joined_at,
      profile: await getProfileById(member.profile_id),
    }))
  );
}

export const getClanMembers = listClanMembers;

async function assertClanManager(clanSlug: string) {
  const viewer = await ensureBootstrapProfile();
  const clan = await getClanBySlug(clanSlug);
  if (!clan) {
    throw new AppError("Clan no encontrado.", 404);
  }

  const members = await listClanMembers(clan.id);
  const membership = members.find((member) => member.profileId === viewer.id);
  const allowed =
    viewer.role === "admin" ||
    clan.leaderProfileId === viewer.id ||
    membership?.role === "leader" ||
    membership?.role === "officer";

  if (!allowed) {
    throw new AppError("No puedes gestionar este clan.", 403);
  }

  return { clan, viewer };
}

export async function createClan(input: ClanInput) {
  if (isDemoMode) {
    return {
      ...demoClans[0]!,
      id: `demo-clan-${slugify(input.name)}`,
      slug: slugify(input.name),
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      visibility: input.visibility,
      gameId: input.gameId,
      preferredPlatforms: input.preferredPlatforms,
      languages: input.languages,
      playstyle: input.playstyle,
      scheduleSummary: input.scheduleSummary,
      requirements: input.requirements,
      openRoles: input.openRoles,
    };
  }

  const viewer = await ensureBootstrapProfile();
  const authed = await ensureAuthedUser();
  const catalog = await getCatalogRows();
  const slug = slugify(input.name);

  const { data: clanRow, error } = await authed.supabase
    .from("clans")
    .insert({
      slug,
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      visibility: input.visibility,
      game_id: input.gameId,
      leader_profile_id: viewer.id,
      playstyle: input.playstyle,
      schedule_summary: input.scheduleSummary,
      requirements: input.requirements,
    })
    .select("*")
    .single<ClanRow>();

  if (error || !clanRow) {
    throw new AppError(error?.message ?? "No se pudo crear el clan.", 400);
  }

  await Promise.all([
    authed.supabase.from("profiles").update({ role: "leader" }).eq("id", viewer.id),
    authed.supabase.from("clan_members").insert({ clan_id: clanRow.id, profile_id: viewer.id, role_code: "leader" }),
  ]);

  if (input.languages.length) {
    await authed.supabase
      .from("clan_languages")
      .insert(input.languages.map((language) => ({ clan_id: clanRow.id, language_code: language })));
  }

  if (input.preferredPlatforms.length) {
    await authed.supabase.from("clan_platforms").insert(
      input.preferredPlatforms
        .map((code) => catalog?.platforms.find((platform) => platform.code === code)?.id)
        .filter((id): id is string => Boolean(id))
        .map((platformId) => ({ clan_id: clanRow.id, platform_id: platformId }))
    );
  }

  if (input.openRoles.length) {
    await authed.supabase
      .from("clan_roles")
      .insert(input.openRoles.map((role) => ({ clan_id: clanRow.id, code: role, label: role })));
  }

  return getClanBySlug(slug);
}

export async function updateClan(slug: string, input: ClanInput) {
  const { clan } = await assertClanManager(slug);

  if (isDemoMode) {
    return { ...clan, ...input, scheduleSummary: input.scheduleSummary, preferredPlatforms: input.preferredPlatforms };
  }

  const authed = await ensureAuthedUser();
  const catalog = await getCatalogRows();

  await authed.supabase
    .from("clans")
    .update({
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      visibility: input.visibility,
      game_id: input.gameId,
      playstyle: input.playstyle,
      schedule_summary: input.scheduleSummary,
      requirements: input.requirements,
    })
    .eq("id", clan.id);

  await Promise.all([
    authed.supabase.from("clan_languages").delete().eq("clan_id", clan.id),
    authed.supabase.from("clan_platforms").delete().eq("clan_id", clan.id),
    authed.supabase.from("clan_roles").delete().eq("clan_id", clan.id),
  ]);

  if (input.languages.length) {
    await authed.supabase
      .from("clan_languages")
      .insert(input.languages.map((language) => ({ clan_id: clan.id, language_code: language })));
  }

  if (input.preferredPlatforms.length) {
    await authed.supabase.from("clan_platforms").insert(
      input.preferredPlatforms
        .map((code) => catalog?.platforms.find((platform) => platform.code === code)?.id)
        .filter((id): id is string => Boolean(id))
        .map((platformId) => ({ clan_id: clan.id, platform_id: platformId }))
    );
  }

  if (input.openRoles.length) {
    await authed.supabase
      .from("clan_roles")
      .insert(input.openRoles.map((role) => ({ clan_id: clan.id, code: role, label: role })));
  }

  return getClanBySlug(slug);
}

export async function listClanJoinRequests(clanSlug: string) {
  const clan = await getClanBySlug(clanSlug);
  if (!clan) {
    throw new AppError("Clan no encontrado.", 404);
  }

  if (isDemoMode) {
    return demoClanJoinRequests
      .filter((request) => request.clanId === clan.id)
      .map((request) => ({
        ...request,
        profile: demoProfiles.find((profile) => profile.id === request.profileId)!,
      }));
  }

  const authed = await ensureAuthedUser();
  const { data } = await authed.supabase
    .from("clan_join_requests")
    .select("*")
    .eq("clan_id", clan.id)
    .order("created_at", { ascending: false })
    .returns<ClanJoinRequestRow[]>();

  return Promise.all(
    (data ?? []).map(async (request) => ({
      id: request.id,
      clanId: request.clan_id,
      profileId: request.profile_id,
      message: request.message,
      status: request.status,
      createdAt: request.created_at,
      profile: await getProfileById(request.profile_id),
    }))
  );
}

export async function createClanJoinRequest(clanSlug: string, message: string) {
  const viewer = await ensureBootstrapProfile();
  const clan = await getClanBySlug(clanSlug);

  if (!clan) {
    throw new AppError("Clan no encontrado.", 404);
  }

  if (isDemoMode) {
    return {
      id: `demo-request-${createHash("md5").update(message).digest("hex").slice(0, 8)}`,
      clanId: clan.id,
      profileId: viewer.id,
      message,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };
  }

  const authed = await ensureAuthedUser();
  const { data, error } = await authed.supabase
    .from("clan_join_requests")
    .insert({ clan_id: clan.id, profile_id: viewer.id, message, status: "pending" })
    .select("*")
    .single<ClanJoinRequestRow>();

  if (error || !data) {
    throw new AppError(error?.message ?? "No se pudo crear la solicitud.", 400);
  }

  await insertNotification(clan.leaderProfileId, "Nueva solicitud de ingreso", `${viewer.nick} ha solicitado entrar en ${clan.name}.`);

  return {
    id: data.id,
    clanId: data.clan_id,
    profileId: data.profile_id,
    message: data.message,
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function approveClanJoinRequest(requestId: string) {
  if (isDemoMode) {
    return { id: requestId, status: "approved" as const };
  }

  const authed = await ensureAuthedUser();
  const { data: requestRow } = await authed.supabase
    .from("clan_join_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle<ClanJoinRequestRow>();

  if (!requestRow) {
    throw new AppError("Solicitud no encontrada.", 404);
  }

  const clan = (await listClans()).find((entry) => entry.id === requestRow.clan_id);
  if (!clan) {
    throw new AppError("Clan no encontrado.", 404);
  }

  await assertClanManager(clan.slug);

  await Promise.all([
    authed.supabase.from("clan_join_requests").update({ status: "approved" }).eq("id", requestId),
    authed.supabase.from("clan_members").upsert({ clan_id: requestRow.clan_id, profile_id: requestRow.profile_id, role_code: "member" }),
    insertNotification(requestRow.profile_id, "Solicitud aprobada", `Tu acceso a ${clan.name} ha sido aprobado.`),
  ]);

  return { id: requestId, status: "approved" as const };
}

export async function rejectClanJoinRequest(requestId: string) {
  if (isDemoMode) {
    return { id: requestId, status: "rejected" as const };
  }

  const authed = await ensureAuthedUser();
  const { data: requestRow } = await authed.supabase
    .from("clan_join_requests")
    .select("*")
    .eq("id", requestId)
    .maybeSingle<ClanJoinRequestRow>();

  if (!requestRow) {
    throw new AppError("Solicitud no encontrada.", 404);
  }

  const clan = (await listClans()).find((entry) => entry.id === requestRow.clan_id);
  if (!clan) {
    throw new AppError("Clan no encontrado.", 404);
  }

  await assertClanManager(clan.slug);

  await Promise.all([
    authed.supabase.from("clan_join_requests").update({ status: "rejected" }).eq("id", requestId),
    insertNotification(requestRow.profile_id, "Solicitud rechazada", `Tu solicitud a ${clan.name} ha sido rechazada.`),
  ]);

  return { id: requestId, status: "rejected" as const };
}

export async function createClanInvitation(clanSlug: string, targetProfileId: string, message?: string) {
  const { clan, viewer } = await assertClanManager(clanSlug);

  if (isDemoMode) {
    return { clanId: clan.id, profileId: targetProfileId, status: "pending" as const };
  }

  const authed = await ensureAuthedUser();
  const { data, error } = await authed.supabase
    .from("clan_invitations")
    .insert({
      clan_id: clan.id,
      profile_id: targetProfileId,
      invited_by_profile_id: viewer.id,
      message: message ?? null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) {
    throw new AppError(error.message, 400);
  }

  await insertNotification(targetProfileId, "Invitación de clan", `${clan.name} te ha enviado una invitación.`);

  return data;
}
