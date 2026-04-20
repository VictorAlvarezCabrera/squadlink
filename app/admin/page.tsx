import Link from "next/link";

import { requireRole } from "@/lib/auth/session";
import { listReports } from "@/services/squadlink-service";

import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";

export default async function Page() {
  await requireRole("admin");
  const reports = await listReports();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Centro de Control</p>
          <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-red-400">Panel Admin</h1>
        </div>
        <Link href="/admin/reportes">
          <Button className="border border-red-400/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 font-black text-xs uppercase whitespace-nowrap card-hover">Reportes</Button>
        </Link>
      </div>
      <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-3">
        <MetricCard label="Total de Reportes" value={String(reports.length)} hint="Incidencias en el sistema" />
        <MetricCard label="Abiertos" value={String(reports.filter((report) => report.status === "open").length)} hint="Pendientes de revisión" />
        <MetricCard label="En Revisión" value={String(reports.filter((report) => report.status === "reviewing").length)} hint="Moderación activa" />
      </div>
    </div>
  );
}
