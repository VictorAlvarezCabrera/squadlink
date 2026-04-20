import { requireViewer } from "@/lib/auth/session";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const viewer = await requireViewer();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">Cuenta</Badge>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Privacidad y preferencias generales</h1>
        <p className="max-w-3xl text-sm text-slate-300/78 sm:text-base">
          MVP debe dar control basico sobre email, privacidad del perfil, notificaciones y futura gestion de cierre de cuenta.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border border-slate-300/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">Resumen de cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
              <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Nick</p>
              <p className="mt-2 text-sm text-slate-200/85">{viewer.profile.nick}</p>
            </div>
            <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
              <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Email</p>
              <p className="mt-2 text-sm text-slate-200/85">{viewer.profile.email}</p>
            </div>
            <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
              <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">Zona horaria</p>
              <p className="mt-2 text-sm text-slate-200/85">{viewer.profile.timezone}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-300/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle className="text-lg text-white">Preferencias MVP</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-300/78">Perfil publico activo para descubrimiento.</p>
            </div>
            <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-300/78">Notificaciones de actividad social y clan centralizadas en `/notifications`.</p>
            </div>
            <div className="rounded-xl border border-slate-300/10 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-300/78">Cierre de cuenta y privacidad fina quedan listos para conectar con backend/RGPD en siguiente iteracion.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
