import Link from "next/link";
import { notFound } from "next/navigation";

import { getIntegrationByGameSlug } from "@/lib/supported-games";
import { getGameBySlug } from "@/services/catalog-service";
import { listClans, listProfiles } from "@/services/squadlink-service";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [game, clans, profiles] = await Promise.all([getGameBySlug(slug), listClans(), listProfiles()]);

  if (!game) {
    notFound();
  }

  const integration = getIntegrationByGameSlug(slug);
  const relatedClans = clans.filter((clan) => clan.gameId === game.id);
  const relatedProfiles = profiles.filter((profile) => profile.favoriteGameIds.includes(game.id)).slice(0, 6);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">{game.genre}</Badge>
          <Badge className={integration ? "border border-cyan-300/20 bg-cyan-300/12 text-cyan-100" : "border border-slate-300/10 bg-slate-800 text-slate-200"}>
            {integration ? "Cuenta enlazable" : "Solo catalogo"}
          </Badge>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{game.name}</h1>
        <p className="max-w-3xl text-sm text-slate-300/78 sm:text-base">
          Ficha de juego de SquadLink. Distingue datos editoriales del catalogo y actividad social de jugadores o clanes dentro de app.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border border-slate-300/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">Estado de integracion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {integration ? (
              <>
                <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                  <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Proveedor</p>
                  <p className="mt-2 text-sm text-slate-200/85">{integration.provider}</p>
                </div>
                <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                  <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Autenticacion</p>
                  <p className="mt-2 text-sm text-slate-200/85">{integration.auth}</p>
                </div>
                <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                  <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Que se mostrara</p>
                  <p className="mt-2 text-sm text-slate-200/85">{integration.summary}</p>
                  <p className="mt-3 text-sm text-slate-300/70">{integration.metrics.join(" · ")}</p>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                <p className="text-sm text-slate-300/78">Este juego forma parte del catalogo visible, pero no tiene stats enlazadas aprobadas en MVP.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border border-slate-300/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">Jugadores relacionados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedProfiles.length ? (
                relatedProfiles.map((profile) => (
                  <Link key={profile.id} href={`/u/${profile.nick}`} className="card-hover block rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-white">{profile.nick}</p>
                    <p className="mt-1 text-sm text-slate-300/75">{profile.bio}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-300/75">Aun no hay perfiles visibles asociados a este juego.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-slate-300/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">Clanes relacionados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedClans.length ? (
                relatedClans.map((clan) => (
                  <Link key={clan.id} href={`/clanes/${clan.slug}`} className="card-hover block rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                    <p className="text-sm font-semibold text-white">{clan.name}</p>
                    <p className="mt-1 text-sm text-slate-300/75">{clan.tagline}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-300/75">Todavia no hay clanes activos para este juego.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
