import { requireViewer } from "@/lib/auth/session";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const viewer = await requireViewer();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Centro de Control</p>
        <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-red-400">Configuración Operativa - {viewer.profile.nick}</h1>
      </div>
      <Card className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
        <CardHeader className="border-b border-red-400/20">
          <CardTitle className="text-sm sm:text-base font-black uppercase tracking-widest text-red-400">Preferencias y Seguridad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-red-300/80">
          <p className="text-xs sm:text-sm font-mono uppercase">Sistema de notificaciones, privacidad y gestión de credenciales</p>
          <p className="text-xs sm:text-sm font-mono uppercase">Módulo de extensión: notificaciones push • Control de visibilidad • Autenticación avanzada</p>
        </CardContent>
      </Card>
    </div>
  );
}
