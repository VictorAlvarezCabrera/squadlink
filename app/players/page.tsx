import Link from "next/link";

import { requireViewer } from "@/lib/auth/session";
import { getCatalog, listProfiles } from "@/services/squadlink-service";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function scoreAgainstViewer(viewer: Awaited<ReturnType<typeof requireViewer>>["profile"], target: Awaited<ReturnType<typeof listProfiles>>[number]) {
  const sharedGames = target.favoriteGameIds.filter((gameId) => viewer.favoriteGameIds.includes(gameId)).length;
  const sharedLanguages = target.languages.filter((language) => viewer.languages.includes(language)).length;
  const sharedRoles = target.gameplayRoles.filter((role) => viewer.gameplayRoles.includes(role)).length;
  const samePlatform = target.mainPlatform === viewer.mainPlatform ? 1 : 0;
  const scheduleOverlap = target.availability.some((slot) => viewer.availability.some((viewerSlot) => viewerSlot.day === slot.day)) ? 1 : 0;

  const raw = sharedGames * 35 + scheduleOverlap * 25 + sharedLanguages * 15 + sharedRoles * 10 + samePlatform * 10;
  const score = raw ? Math.min(99, raw) : null;
  const reasons = [
    sharedGames ? "mismo juego" : null,
    scheduleOverlap ? "mismo horario" : null,
    sharedLanguages ? "mismo idioma" : null,
    samePlatform ? "misma plataforma" : null,
  ].filter((value): value is string => Boolean(value));

  return { score, reasons: reasons.length ? reasons.slice(0, 3) : ["compatibilidad parcial"] };
}

export default async function Page() {
  const viewer = await requireViewer();
  const [profiles, catalog] = await Promise.all([listProfiles(), getCatalog()]);
  const otherProfiles = profiles.filter((profile) => profile.id !== viewer.profile.id);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">Jugadores</Badge>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Explora jugadores por afinidad visible</h1>
        <p className="max-w-3xl text-sm text-slate-300/78 sm:text-base">
          PDF fija esta pantalla como pilar de descubrimiento: juego, plataforma, idioma, horario, rol y fiabilidad deben ayudar a decidir rapido.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {otherProfiles.map((profile) => {
          const compatibility = scoreAgainstViewer(viewer.profile, profile);

          return (
            <Card key={profile.id} className="border border-slate-300/10 bg-white/5 text-white">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg text-white">{profile.nick}</CardTitle>
                  <p className="mt-1 text-sm text-slate-300/75">{profile.bio}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs tracking-[0.22em] text-cyan-100/70 uppercase">Compatibilidad</p>
                  <p className="text-2xl font-black text-cyan-100">{compatibility.score ? `${compatibility.score}%` : "Parcial"}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((language) => (
                    <Badge key={`${profile.id}-${language}`} variant="outline" className="border-slate-300/15 text-slate-200/85">
                      {language}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="border-slate-300/15 text-slate-200/85">
                    {profile.mainPlatform}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {compatibility.reasons.map((reason) => (
                    <Badge key={`${profile.id}-${reason}`} className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">
                      {reason}
                    </Badge>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-3">
                    <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Juegos favoritos</p>
                    <p className="mt-2 text-sm text-slate-200/85">
                      {profile.favoriteGameIds.map((gameId) => catalog.games.find((game) => game.id === gameId)?.name ?? gameId).join(", ")}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-3">
                    <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Fiabilidad</p>
                    <p className="mt-2 text-sm text-slate-200/85">{profile.reliabilityScore}/100</p>
                  </div>
                </div>

                <Link href={`/u/${profile.nick}`} className="text-sm font-medium text-cyan-100 hover:text-cyan-50">
                  Ver perfil publico
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
