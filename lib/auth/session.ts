import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { authFixtures, profiles } from "@/data/demo";
import { demoAuthCookie } from "@/lib/constants";
import { isDemoMode } from "@/lib/env";
import type { AppRole, Profile } from "@/types/domain";
import { getViewerProfile as getViewerProfileFromService } from "@/services/profile-service";

function profileById(profileId?: string) {
  return profiles.find((profile) => profile.id === profileId) ?? null;
}

export interface Viewer {
  profile: Profile;
}

export async function getViewer(): Promise<Viewer | null> {
  if (isDemoMode) {
    const cookieStore = await cookies();
    const demoProfile = profileById(cookieStore.get(demoAuthCookie)?.value);

    if (demoProfile) {
      return { profile: demoProfile };
    }

    return null;
  }

  try {
    const profile = await getViewerProfileFromService();
    return profile ? { profile } : null;
  } catch {
    return null;
  }
}

export async function requireViewer(redirectTo = "/login") {
  const viewer = await getViewer();

  if (!viewer) {
    redirect(redirectTo);
  }

  return viewer;
}

export async function requireRole(role: AppRole) {
  const viewer = await requireViewer();

  if (viewer.profile.role !== role && viewer.profile.role !== "admin") {
    redirect("/dashboard");
  }

  return viewer;
}

export function findDemoProfileForCredentials(email: string, password: string) {
  const fixture = authFixtures.find((candidate) => candidate.email === email && candidate.password === password);
  return profileById(fixture?.profileId);
}
