import Link from "next/link";

import { supportedIntegrations } from "@/lib/supported-games";
import { getCatalog } from "@/services/squadlink-service";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const catalog = await getCatalog();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">Juegos</Badge>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Catalogo visible y juegos enlazables</h1>
        <p className="max-w-3xl text-sm text-slate-300/78 sm:text-base">
          PDF separa dos cosas: catalogo amplio y stats enlazadas solo donde API gratuita y viable existe. Esta pagina muestra ambas capas sin mezclarlas.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="border border-slate-300/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">Catalogo de juegos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {catalog.games.map((game) => {
              const integration = supportedIntegrations.find((entry) => entry.slug === game.slug);

              return (
                <Link key={game.id} href={`/games/${game.slug}`} className="card-hover rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{game.name}</p>
                      <p className="mt-1 text-sm text-slate-300/75">{game.genre}</p>
                    </div>
                    <Badge className={integration ? "border border-cyan-300/20 bg-cyan-300/12 text-cyan-100" : "border border-slate-300/10 bg-slate-800 text-slate-200"}>
                      {integration ? "Cuenta enlazable" : "Solo catalogo"}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border border-slate-300/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">Proveedores aprobados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {supportedIntegrations.map((integration) => (
              <div key={integration.slug} className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{integration.provider}</p>
                  <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">
                    {integration.type === "catalog" ? "Catalogo" : "Stats"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-slate-300/75">{integration.gameName}</p>
                <p className="mt-2 text-sm text-slate-300/70">{integration.notes}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
