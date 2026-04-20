import { listNotifications } from "@/services/squadlink-service";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const notifications = await listNotifications();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="border border-cyan-300/20 bg-cyan-300/12 text-cyan-100">Notificaciones</Badge>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Senales importantes de la plataforma</h1>
        <p className="max-w-3xl text-sm text-slate-300/78 sm:text-base">
          Seguimientos, respuestas a LFG, actividad de clan y estados relevantes. Objetivo: devolverte a accion correcta, no llenar ruido.
        </p>
      </section>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="border border-slate-300/10 bg-white/5 text-white">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg text-white">{notification.title}</CardTitle>
                <p className="mt-2 text-sm text-slate-300/78">{notification.body}</p>
              </div>
              <Badge className={notification.isRead ? "border border-slate-300/10 bg-slate-800 text-slate-200" : "border border-cyan-300/20 bg-cyan-300/12 text-cyan-100"}>
                {notification.isRead ? "Leida" : "Nueva"}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-xs tracking-[0.2em] text-slate-400 uppercase">{new Date(notification.createdAt).toLocaleString("es-ES")}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
