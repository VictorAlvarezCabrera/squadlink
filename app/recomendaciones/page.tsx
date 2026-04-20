import { requireViewer } from "@/lib/auth/session";
import { getRecommendations } from "@/services/squadlink-service";

import { CompatibilityCard } from "@/components/shared/compatibility-card";

export default async function Page() {
  const viewer = await requireViewer();
  const recommendations = await getRecommendations(viewer.profile.id);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Análisis Táctico</p>
        <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-red-400">Compatibilidad Operacional: {viewer.profile.nick}</h1>
        <p className="mt-3 text-xs sm:text-sm text-red-300/80 font-mono uppercase">Algoritmo: Ventana horaria 30% • Juego y plataforma 25% • Especialidad táctica 15% • Comunicación 15% • Confiabilidad 15%</p>
      </div>
      <div className="space-y-4 sm:space-y-5">
        {recommendations.map((entry) => (
          <CompatibilityCard key={entry.clan.id} clan={entry.clan} result={entry.result} />
        ))}
      </div>
    </div>
  );
}
