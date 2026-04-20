import Link from "next/link";

import { listEvents, listFeaturedClans, listLfgPosts } from "@/services/squadlink-service";
import type { Clan } from "@/types/domain";

import { SectionHeading } from "@/components/shared/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function HomePage() {
  const [featuredClans, events, lfgPosts] = await Promise.all([
    listFeaturedClans(),
    listEvents(),
    listLfgPosts(),
  ]);

  return (
    <div className="space-y-24 pb-24">
      <section className="overflow-hidden border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-12 rounded-[2rem] border border-red-500/20 bg-[linear-gradient(140deg,rgba(28,12,14,0.95)_0%,rgba(12,12,13,0.98)_58%,rgba(8,8,8,1)_100%)] p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
          <div className="space-y-8">
            <Badge className="bg-red-500/15 text-red-100">MVP serio para DAW con Next.js + Supabase</Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Encuentra el clan adecuado, organiza squads y mide el encaje antes de entrar.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-300">
                SquadLink conecta jugadores y clanes por juego, plataforma, horario, idioma, rol y fiabilidad.
                Sin ruido de red social. Con lógica defendible.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/registro">
                <Button size="lg" className="bg-red-500 text-white hover:bg-red-400">
                  Crear cuenta
                </Button>
              </Link>
              <Link href="/clanes">
                <Button size="lg" variant="outline" className="border-white/15 bg-white/5 text-white hover:bg-white/10">
                  Explorar clanes
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat label="Clanes demo" value="3" />
              <Stat label="Eventos activos" value={String(events.length)} />
              <Stat label="Publicaciones LFG" value={String(lfgPosts.length)} />
            </div>
          </div>

          <div className="grid gap-4 rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
            {featuredClans.map((clan: Clan) => (
              <Card key={clan.id} className="border-white/10 bg-black/50 text-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{clan.name}</CardTitle>
                    <Badge variant="secondary" className="bg-white/10 text-white">
                      {clan.playstyle}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-zinc-300">{clan.tagline}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-zinc-300">
                    {clan.languages.map((language: string) => (
                      <Badge key={language} variant="outline" className="border-white/10 text-zinc-200">
                        {language.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/clanes/${clan.slug}`} className="text-sm font-medium text-red-300">
                    Ver detalle
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="Tres flujos claros para enseñar producto, arquitectura y negocio"
          description="Descubrir clanes, organizar operativa de equipo y recomendar encaje con una fórmula transparente."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <FeatureCard
            title="Perfil operativo"
            description="Cada jugador define juegos, roles, plataforma, idiomas, disponibilidad semanal y reputación."
          />
          <FeatureCard
            title="Clanes y eventos"
            description="Líderes publican requisitos, aceptan solicitudes y crean eventos con control de asistencia."
          />
          <FeatureCard
            title="Compatibilidad defendible"
            description="La puntuación 0-100 se desglosa por horario, juego, plataforma, rol, idioma y fiabilidad."
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/35 p-5">
      <p className="text-sm text-zinc-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="border-white/10 bg-black/35 text-white">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="leading-7 text-zinc-300">{description}</p>
      </CardContent>
    </Card>
  );
}
