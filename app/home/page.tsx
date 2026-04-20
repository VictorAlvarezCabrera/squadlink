import Link from "next/link";

import { requireViewer } from "@/lib/auth/session";
import { getRecommendations, listEvents, listFeaturedClans, listLfgPosts } from "@/services/squadlink-service";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const viewer = await requireViewer();
  const [recommendations, featuredClans, events, lfgPosts] = await Promise.all([
    getRecommendations(viewer.profile.id),
    listFeaturedClans(),
    listEvents(),
    listLfgPosts(),
  ]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">Inicio</Badge>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Actividad y recomendaciones para {viewer.profile.nick}</h1>
        <p className="max-w-3xl text-sm text-slate-300/78 sm:text-base">
          Centro privado de SquadLink. Aqui se cruzan clanes sugeridos, eventos proximos y publicaciones de Busco grupo (LFG) con mejor encaje.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border border-slate-300/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">Clanes sugeridos para ti</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.slice(0, 4).map((entry) => (
              <Link key={entry.clan.id} href={`/clanes/${entry.clan.slug}`} className="card-hover block rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{entry.clan.name}</p>
                    <p className="mt-1 text-sm text-slate-300/75">{entry.clan.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs tracking-[0.22em] text-cyan-100/70 uppercase">Compatibilidad</p>
                    <p className="text-2xl font-black text-cyan-100">{entry.result.score}%</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-300/70">{entry.result.summary}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card className="border border-slate-300/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">LFG activos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lfgPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                  <p className="text-sm font-semibold text-white">{post.title}</p>
                  <p className="mt-1 text-sm text-slate-300/75">
                    {post.game.name} · {post.languages.join(", ")}
                  </p>
                  <p className="mt-2 text-sm text-slate-300/70">{post.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-300/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">Proximos eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {events.slice(0, 3).map((event) => (
                <div key={event.id} className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                  <p className="text-sm font-semibold text-white">{event.title}</p>
                  <p className="mt-1 text-sm text-slate-300/75">{event.clan.name}</p>
                  <p className="mt-2 text-sm text-slate-300/70">{event.attendeeCount}/{event.capacity} asistentes confirmados</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-300/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">Explora mas comunidad</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {featuredClans.map((clan) => (
                <Link key={clan.id} href={`/clanes/${clan.slug}`} className="card-hover rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                  <p className="text-sm font-semibold text-white">{clan.name}</p>
                  <p className="mt-1 text-sm text-slate-300/75">{clan.languages.join(", ")}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
