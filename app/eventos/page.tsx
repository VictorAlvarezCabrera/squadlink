import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import { listEvents } from "@/services/squadlink-service";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const events = await listEvents();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Calendario Táctico</p>
        <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-red-400">Misiones</h1>
      </div>
      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link href={`/eventos/${event.id}`} key={event.id} className="group">
            <Card className="h-full border border-red-400/20 bg-red-500/5 text-red-300/80 transition card-hover">
              <CardHeader className="border-b border-red-400/20">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-400 group-hover:text-red-300/90 transition-colors duration-300">{event.title}</CardTitle>
                  <Badge className="bg-red-500/10 text-red-300/80 border border-red-400/20 font-black text-xs uppercase">{event.game.name}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm text-red-300/80 font-mono uppercase">{event.description}</p>
                <p className="text-xs sm:text-sm text-red-400/60 font-mono">{formatDateTime(event.startsAt)}</p>
                <p className="text-xs sm:text-sm text-red-400/60 font-mono uppercase">Escuadra: {event.clan.name}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
