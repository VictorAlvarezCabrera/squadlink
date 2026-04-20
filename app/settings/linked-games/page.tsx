import { supportedIntegrations } from "@/lib/supported-games";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">Juegos vinculados</Badge>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Integraciones soportadas y estado de enlace</h1>
        <p className="max-w-3xl text-sm text-slate-300/78 sm:text-base">
          MVP distingue juego favorito de juego enlazado con datos reales. Aqui se muestran proveedores viables, autenticacion y tipo de resumen de stats.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {supportedIntegrations.map((integration) => (
          <Card key={integration.slug} className="border border-slate-300/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg text-white">{integration.gameName}</CardTitle>
                <p className="mt-1 text-sm text-slate-300/75">{integration.provider}</p>
              </div>
              <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">{integration.type === "catalog" ? "Catalogo" : "Stats"}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-slate-300/78">{integration.summary}</p>
              <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-3">
                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Autenticacion</p>
                <p className="mt-2 text-sm text-slate-200/85">{integration.auth}</p>
              </div>
              <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-3">
                <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Metricas visibles</p>
                <p className="mt-2 text-sm text-slate-200/85">{integration.metrics.join(" · ")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
