import Link from "next/link";

import { supportedIntegrations } from "@/lib/supported-games";
import { getCatalog, listEvents, listFeaturedClans, listLfgPosts } from "@/services/squadlink-service";
import type { Clan } from "@/types/domain";

import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function HomePage() {
  const [featuredClans, events, lfgPosts, catalog] = await Promise.all([
    listFeaturedClans(),
    listEvents(),
    listLfgPosts(),
    getCatalog(),
  ]);

  return (
    <div className="space-y-16 pb-16 sm:space-y-24 sm:pb-24">
      <section className="overflow-hidden rounded-[2rem] border border-cyan-300/10 bg-slate-950/60 shadow-[0_30px_120px_-60px_rgba(34,211,238,0.5)]">
        <div className="mx-auto w-full max-w-full px-3 py-12 sm:px-6 sm:py-16 md:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-8 rounded-[1.5rem] border border-cyan-300/15 bg-[linear-gradient(135deg,rgba(15,23,42,0.92),rgba(17,24,39,0.84),rgba(8,47,73,0.7))] p-4 sm:gap-12 sm:p-6 md:p-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6 sm:space-y-8">
              <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                MVP social gamer · Next.js + Supabase
              </Badge>
              <div className="space-y-4 sm:space-y-5">
                <h1 className="max-w-3xl text-3xl leading-tight font-black tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                  Descubre jugadores compatibles, muestra stats verificables y mueve tu comunidad.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-200/78 sm:text-base sm:leading-8">
                  SquadLink conecta perfil publico, descubrimiento, clanes, eventos y Busco grupo (LFG). Catalogo amplio de juegos,
                  cuentas enlazadas solo para APIs gratuitas y viables.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <Link href="/registro">
                  <Button size="lg" className="card-hover border border-cyan-300/30 bg-cyan-300/18 text-xs font-semibold tracking-[0.24em] text-cyan-100 uppercase hover:bg-cyan-300/28">
                    Crear cuenta
                  </Button>
                </Link>
                <Link href="/players">
                  <Button
                    size="lg"
                    variant="outline"
                    className="card-hover border border-slate-300/20 text-xs font-semibold tracking-[0.24em] text-slate-100 uppercase hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  >
                    Explorar jugadores
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <Stat label="Clanes" value={String(featuredClans.length)} />
                <Stat label="Eventos" value={String(events.length)} />
                <Stat label="LFG activos" value={String(lfgPosts.length)} />
              </div>
            </div>

            <div className="grid gap-3 border-l border-cyan-300/10 pl-4 sm:gap-4 sm:pl-6">
              {featuredClans.map((clan: Clan) => (
                <Card key={clan.id} className="card-hover border border-slate-300/10 bg-white/5 text-white">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                      <CardTitle className="text-sm font-semibold tracking-wide text-white">{clan.name}</CardTitle>
                      <Badge variant="secondary" className="border border-cyan-300/20 bg-cyan-300/15 text-xs font-medium text-cyan-100 uppercase">
                        {clan.playstyle}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs sm:space-y-3">
                    <p className="leading-tight text-slate-300/80">{clan.tagline}</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {clan.languages.map((language: string) => (
                        <Badge key={language} variant="outline" className="border border-slate-300/15 text-xs text-slate-200/85 uppercase">
                          {language}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/clanes/${clan.slug}`} className="text-xs font-medium tracking-[0.2em] text-cyan-100/80 uppercase transition-colors duration-300 hover:text-cyan-100">
                      Ver clan
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-full px-3 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Base del producto"
          title="Identidad, descubrimiento, comunidad y stats enlazadas"
          description="SquadLink no es un tracker universal ni un Discord clonado. Producto se centra en perfil social util, matching visible, clanes vivos y juegos con integraciones defendibles."
        />
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-3">
          <FeatureCard
            title="Perfil publico util"
            description="Avatar, bio, idiomas, plataformas, horarios, juegos favoritos, cuentas enlazadas y actividad reciente."
          />
          <FeatureCard
            title="Clanes, eventos y LFG"
            description="Comunidad persistente, actividad planificada y publicaciones rapidas para jugar ahora, hoy o este fin de semana."
          />
          <FeatureCard
            title="Compatibilidad visible"
            description="Score explicable en tarjetas y sugerencias. Mismo juego, mismo horario, idioma, rol y actividad reciente."
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-full px-3 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Catalogo y APIs"
          title="Juegos visibles amplios, cuentas enlazadas solo si API es viable"
          description="Catalogo general alimentado por RAWG. Vinculacion y stats reservadas a proveedores gratuitos y defendibles para MVP."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border border-slate-300/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">Catalogo actual</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {catalog.games.slice(0, 6).map((game) => (
                <Link key={game.id} href={`/games/${game.slug}`} className="card-hover rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                  <p className="text-sm font-semibold text-white">{game.name}</p>
                  <p className="mt-1 text-sm text-slate-300/75">{game.genre}</p>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-300/10 bg-white/5 text-white">
            <CardHeader>
              <CardTitle className="text-lg text-white">Integraciones MVP aprobadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {supportedIntegrations.filter((entry) => entry.type === "stats").map((entry) => (
                <div key={entry.slug} className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">{entry.gameName}</p>
                    <Badge className="border border-cyan-300/20 bg-cyan-300/15 text-cyan-100">
                      {entry.state === "approved_limited" ? "Soporte con limites" : "Soporte MVP"}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-300/75">{entry.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-hover rounded-xl border border-slate-300/10 bg-white/5 p-3 sm:p-5">
      <p className="text-xs font-semibold tracking-[0.24em] text-cyan-100/80 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-black text-white sm:mt-2 sm:text-3xl">{value}</p>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="card-hover border border-slate-300/10 bg-white/5 text-white">
      <CardHeader>
        <CardTitle className="text-base font-semibold tracking-tight text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-slate-300/78">{description}</p>
      </CardContent>
    </Card>
  );
}
