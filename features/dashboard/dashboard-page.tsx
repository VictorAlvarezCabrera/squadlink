import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import { getDashboardSnapshot } from "@/services/squadlink-service";

import { MetricCard } from "@/components/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function DashboardPage({ profileId }: { profileId: string }) {
  const snapshot = await getDashboardSnapshot(profileId);

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Dashboard</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-red-400">Operaciones, {snapshot.profile.nick}</h1>
        <p className="text-xs sm:text-sm text-red-300/80 font-mono uppercase tracking-wide">Sistema de monitoreo de clanes, eventos y fiabilidad táctica</p>
      </div>

      <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-3">
        <MetricCard label="Clanes activos" value={String(snapshot.memberships.length)} hint="Membresías operacionales actuales" />
        <MetricCard label="Próximos eventos" value={String(snapshot.upcomingEvents.length)} hint="Misiones planificadas" />
        <MetricCard label="Nivel táctico" value={`${snapshot.profile.reliabilityScore}`} hint="Fiabilidad en operaciones" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
          <CardHeader className="border-b border-red-400/20 flex flex-row items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-black uppercase tracking-widest text-red-400">Próximas Misiones</CardTitle>
            <Link href="/eventos">
              <Button variant="outline" className="border border-red-400/20 bg-red-500/10 text-red-300/80 hover:bg-red-500/15 hover:border-red-400/30 text-xs font-black uppercase card-hover">
                Ver todas
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.upcomingEvents.map((event) => (
              <div key={event.id} className="border border-red-400/20 bg-red-500/5 p-3 sm:p-4 card-hover">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-300/80">{event.title}</p>
                    <p className="text-xs text-red-400/60 font-mono">{formatDateTime(event.startsAt)}</p>
                  </div>
                  <Badge className="bg-red-500/10 text-red-300/80 border border-red-400/20 font-black text-xs uppercase">{event.attendeeCount}/{event.capacity}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
          <CardHeader className="border-b border-red-400/20">
            <CardTitle className="text-sm sm:text-base font-black uppercase tracking-widest text-red-400">Solicitudes Tácticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.openRequests.length === 0 ? (
              <p className="text-xs sm:text-sm text-red-400/60 font-mono uppercase">SISTEMA SIN SOLICITUDES PENDIENTES</p>
            ) : (
              snapshot.openRequests.map((request) => (
                <div key={request.id} className="border border-red-400/20 bg-red-500/5 p-3 sm:p-4 card-hover">
                  <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-red-300/80">{request.message}</p>
                  <p className="mt-2 text-xs text-red-400/60 font-mono uppercase">Estado: {request.status}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
