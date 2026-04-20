import { eventAttendees as demoEventAttendees, events as demoEvents, games as demoGames, clans as demoClans, profiles as demoProfiles } from "@/data/demo";
import { AppError } from "@/lib/app-error";
import { createServerBackendClient } from "@/lib/backend/server";
import type { AttendanceStatus, EventVisibility } from "@/types/domain";

import { getClanBySlug, listClanMembers, listClans } from "@/services/clan-service";
import {
  EventAttendeeRow,
  EventRow,
  ensureAuthedUser,
  ensureBootstrapProfile,
  getProfileById,
  isDemoMode,
} from "@/services/_shared";

export interface EventInput {
  clanSlug: string;
  title: string;
  description: string;
  startsAt: string;
  capacity: number;
  visibility: EventVisibility;
}

async function assertEventManager(clanSlug: string) {
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
    throw new AppError("No puedes gestionar eventos de este clan.", 403);
  }

  return { viewer, clan };
}

export async function listEvents() {
  if (isDemoMode) {
    return demoEvents.map((event) => ({
      ...event,
      clan: demoClans.find((clan) => clan.id === event.clanId)!,
      game: demoGames.find((game) => game.id === event.gameId)!,
    }));
  }

  const supabase = await createServerBackendClient();
  const [events, clans] = await Promise.all([
    supabase!.from("events").select("*").order("starts_at", { ascending: true }).returns<EventRow[]>(),
    listClans(),
  ]);

  const { data: attendees } = await supabase!.from("event_attendees").select("*").returns<EventAttendeeRow[]>();
  const catalogGames = (await supabase!.from("games").select("*")).data ?? [];

  return (events.data ?? []).map((event) => ({
    id: event.id,
    clanId: event.clan_id,
    gameId: event.game_id,
    title: event.title,
    description: event.description,
    startsAt: event.starts_at,
    capacity: event.capacity,
    visibility: event.visibility,
    attendeeCount: (attendees ?? []).filter((entry) => entry.event_id === event.id && entry.status === "going").length,
    clan: clans.find((clan) => clan.id === event.clan_id)!,
    game: catalogGames.find((game) => game.id === event.game_id)!,
  }));
}

export async function getEventById(id: string) {
  if (isDemoMode) {
    const event = demoEvents.find((entry) => entry.id === id);
    if (!event) {
      return null;
    }

    return {
      ...event,
      clan: demoClans.find((clan) => clan.id === event.clanId)!,
      game: demoGames.find((game) => game.id === event.gameId)!,
      attendees: demoEventAttendees
        .filter((entry) => entry.eventId === id)
        .map((entry) => ({ ...entry, profile: demoProfiles.find((profile) => profile.id === entry.profileId)! })),
    };
  }

  const event = (await listEvents()).find((entry) => entry.id === id);
  if (!event) {
    return null;
  }

  const supabase = await createServerBackendClient();
  const { data } = await supabase!.from("event_attendees").select("*").eq("event_id", id).returns<EventAttendeeRow[]>();

  return {
    ...event,
    attendees: await Promise.all(
      (data ?? []).map(async (attendee) => ({
        id: attendee.id,
        eventId: attendee.event_id,
        profileId: attendee.profile_id,
        status: attendee.status,
        profile: await getProfileById(attendee.profile_id),
      }))
    ),
  };
}

export async function createEvent(input: EventInput) {
  const { viewer, clan } = await assertEventManager(input.clanSlug);

  if (isDemoMode) {
    return {
      ...demoEvents[0]!,
      id: `demo-event-${Date.now()}`,
      clanId: clan.id,
      gameId: clan.gameId,
      title: input.title,
      description: input.description,
      startsAt: input.startsAt,
      capacity: input.capacity,
      visibility: input.visibility,
      attendeeCount: 0,
    };
  }

  const authed = await ensureAuthedUser();
  const { data, error } = await authed.supabase
    .from("events")
    .insert({
      clan_id: clan.id,
      game_id: clan.gameId,
      title: input.title,
      description: input.description,
      starts_at: input.startsAt,
      capacity: input.capacity,
      visibility: input.visibility,
      created_by_profile_id: viewer.id,
    })
    .select("*")
    .single<EventRow>();

  if (error || !data) {
    throw new AppError(error?.message ?? "No se pudo crear el evento.", 400);
  }

  return getEventById(data.id);
}

export async function updateEvent(eventId: string, input: Omit<EventInput, "clanSlug">) {
  const existing = await getEventById(eventId);
  if (!existing) {
    throw new AppError("Evento no encontrado.", 404);
  }

  await assertEventManager(existing.clan.slug);

  if (isDemoMode) {
    return { ...existing, title: input.title, description: input.description, startsAt: input.startsAt, capacity: input.capacity, visibility: input.visibility };
  }

  const authed = await ensureAuthedUser();
  await authed.supabase
    .from("events")
    .update({
      title: input.title,
      description: input.description,
      starts_at: input.startsAt,
      capacity: input.capacity,
      visibility: input.visibility,
    })
    .eq("id", eventId);

  return getEventById(eventId);
}

export async function respondToEventAttendance(eventId: string, status: AttendanceStatus) {
  const viewer = await ensureBootstrapProfile();
  const event = await getEventById(eventId);
  if (!event) {
    throw new AppError("Evento no encontrado.", 404);
  }

  if (isDemoMode) {
    return { eventId, profileId: viewer.id, status };
  }

  const authed = await ensureAuthedUser();
  const { data, error } = await authed.supabase
    .from("event_attendees")
    .upsert({ event_id: eventId, profile_id: viewer.id, status }, { onConflict: "event_id,profile_id" })
    .select("*")
    .single<EventAttendeeRow>();

  if (error || !data) {
    throw new AppError(error?.message ?? "No se pudo registrar la asistencia.", 400);
  }

  return { eventId: data.event_id, profileId: data.profile_id, status: data.status };
}
