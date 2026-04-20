import { requireViewer } from "@/lib/auth/session";
import { ProfilePage } from "@/features/profiles/profile-page";

export default async function Page() {
  const viewer = await requireViewer();

  return <ProfilePage profile={viewer.profile} editable />;
}
