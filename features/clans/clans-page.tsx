import Link from "next/link";

import type { Clan } from "@/types/domain";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function ClansPage({ clans }: { clans: Clan[] }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Directorio Táctico</p>
          <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-red-400">Clanes</h1>
          <p className="mt-3 text-xs sm:text-sm text-red-300/80 font-mono uppercase tracking-wide">Escuadras operacionales multijuego</p>
        </div>
        <Link href="/clanes/crear">
          <Button className="border border-red-400/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 font-black text-xs uppercase whitespace-nowrap card-hover">Crear Clan</Button>
        </Link>
      </div>

      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {clans.map((clan) => (
          <Card key={clan.id} className="border border-red-400/20 bg-red-500/5 text-red-300/80 flex flex-col card-hover">
            <CardHeader className="border-b border-red-400/20">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-400">{clan.name}</CardTitle>
                <Badge className="bg-red-500/10 text-red-300/80 border border-red-400/20 font-black text-xs uppercase">{clan.playstyle}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 flex-grow">
              <p className="text-xs sm:text-sm leading-5 text-red-300/80 font-mono uppercase">{clan.description}</p>
              <div className="flex flex-wrap gap-2">
                {clan.languages.map((language) => (
                  <Badge key={language} variant="outline" className="border border-red-400/20 text-red-300/80 bg-red-500/5 font-black text-xs uppercase">
                    {language.toUpperCase()}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-red-400/60 font-mono uppercase">{clan.scheduleSummary}</p>
            </CardContent>
            <CardFooter className="border-t border-red-400/20 justify-between pt-3 sm:pt-4">
              <span className="text-xs sm:text-sm text-red-400/60 font-mono uppercase">{clan.memberCount} operativos</span>
              <Link href={`/clanes/${clan.slug}`} className="text-xs sm:text-sm font-black text-red-400/70 hover:text-red-400 uppercase transition-colors duration-300">
                Detalles
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
