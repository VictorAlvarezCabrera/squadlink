import { clanJoinRequests as demoClanJoinRequests, reviews as demoReviews } from "@/data/demo";

import { listClanJoinRequests, listClanMembers, listClans } from "@/services/clan-service";
import { listEvents } from "@/services/event-service";
import { getProfileById, isDemoMode } from "@/services/_shared";

export async function getDashboardSnapshot(profileId: string) {
  const profile = await getProfileById(profileId);
  const allClans = await listClans();
  const memberships = (
    await Promise.all(
      allClans.map(async (clan) => ({
        clan,
        member: (await listClanMembers(clan.id)).find((entry) => entry.profileId === profileId) ?? null,
      }))
    )
  ).filter((entry) => entry.member);

  return {
    profile,
    memberships: memberships.map((entry) => ({
      id: entry.member!.id,
      clanId: entry.member!.clanId,
      profileId: entry.member!.profileId,
      role: entry.member!.role,
      joinedAt: entry.member!.joinedAt,
      clan: entry.clan,
    })),
    upcomingEvents: (await listEvents()).filter((event) => memberships.some((entry) => entry.clan.id === event.clanId)).slice(0, 3),
    reviews: demoReviews.filter((review) => review.targetProfileId === profileId),
    openRequests: isDemoMode
      ? demoClanJoinRequests.filter((request) => request.profileId === profileId)
      : (await Promise.all(allClans.map((clan) => listClanJoinRequests(clan.slug)))).flat().filter((request) => request.profileId === profileId),
  };
}

export async function listClanMemberProfiles() {
  const clans = await listClans();
  const members = (await Promise.all(clans.map((clan) => listClanMembers(clan.id)))).flat();
  return members.map((member) => member.profile);
}
