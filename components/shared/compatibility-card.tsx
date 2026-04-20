import Link from "next/link";

import type { Clan, CompatibilityResult } from "@/types/domain";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function CompatibilityCard({
  clan,
  result,
}: {
  clan: Clan;
  result: CompatibilityResult;
}) {
  return (
    <Card className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
      <CardHeader className="border-b border-red-400/20 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-2 flex-grow">
          <Badge className="bg-red-500/10 text-red-300/80 border border-red-400/20 font-black text-xs uppercase">Análisis Táctico</Badge>
          <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-widest text-red-400">{clan.name}</CardTitle>
          <p className="text-xs sm:text-sm text-red-300/80 font-mono uppercase">{clan.tagline}</p>
        </div>
        <div className="border border-red-400/30 bg-red-500/10 px-3 sm:px-4 py-2 sm:py-3 text-right whitespace-nowrap card-hover">
          <p className="text-xs uppercase tracking-widest font-black text-red-400">Puntuación</p>
          <p className="text-2xl sm:text-3xl font-black text-red-400">{result.score}</p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 pt-4 sm:pt-5">
        <Factor label="Horario" value={result.breakdown.schedule} total={30} />
        <Factor label="Juego/Plataforma" value={result.breakdown.gamePlatform} total={25} />
        <Factor label="Especialidad" value={result.breakdown.roleFit} total={15} />
        <Factor label="Comunicación" value={result.breakdown.languageFit} total={15} />
        <Factor label="Confiabilidad" value={result.breakdown.reliability} total={15} />
      </CardContent>
      <CardFooter className="border-t border-red-400/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-4">
        <p className="text-xs sm:text-sm text-red-300/80 font-mono uppercase">{result.summary}</p>
        <Link href={`/clanes/${clan.slug}`}>
          <Button className="border border-red-400/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 font-black text-xs uppercase whitespace-nowrap card-hover">Ver Escuadra</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

function Factor({ label, value, total }: { label: string; value: number; total: number }) {
  const width = Math.round((value / total) * 100);

  return (
    <div className="space-y-2 border border-red-400/20 bg-red-500/5 p-3 sm:p-4 card-hover">
      <div className="flex items-center justify-between text-xs sm:text-sm text-red-400 font-black uppercase tracking-wider">
        <span>{label}</span>
        <span>
          {value}/{total}
        </span>
      </div>
      <div className="h-2 bg-red-400/20">
        <div className="h-2 bg-red-400/70" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
