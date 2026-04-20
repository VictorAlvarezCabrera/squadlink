import { notFound } from "next/navigation";

import { ProfilePage } from "@/features/profiles/profile-page";
import { getProfileByNick } from "@/services/squadlink-service";

export default async function Page({ params }: { params: Promise<{ alias: string }> }) {
  const { alias } = await params;
  const profile = await getProfileByNick(alias);

  if (!profile) {
    notFound();
  }

  return <ProfilePage profile={profile} />;
}
