import { createLfgAction } from "@/app/domain-actions";
import { formatDateTime } from "@/lib/format";
import { listLfgPosts } from "@/services/squadlink-service";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function Page() {
  const posts = await listLfgPosts();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Reclutamiento Táctico</p>
        <h1 className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-red-400">Operaciones LFG</h1>
      </div>
      <Card className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
        <CardHeader className="border-b border-red-400/20">
          <CardTitle className="text-sm sm:text-base font-black uppercase tracking-widest text-red-400">Publicar Solicitud de Escuadra</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form action={createLfgAction} className="grid gap-3 sm:gap-4">
            <Input name="gameId" className="border border-red-400/20 bg-red-500/5 text-red-300/80 placeholder-red-400/40 font-mono text-xs sm:text-sm uppercase" placeholder="ID del juego" />
            <Input name="title" className="border border-red-400/20 bg-red-500/5 text-red-300/80 placeholder-red-400/40 font-mono text-xs sm:text-sm uppercase" placeholder="Operación" />
            <Textarea name="description" className="min-h-24 border border-red-400/20 bg-red-500/5 text-red-300/80 placeholder-red-400/40 font-mono text-xs sm:text-sm uppercase" placeholder="Descripción de la misión y horario." />
            <Input name="platforms" defaultValue="pc" className="border border-red-400/20 bg-red-500/5 text-red-300/80 placeholder-red-400/40 font-mono text-xs sm:text-sm uppercase" placeholder="Plataformas (csv)" />
            <Input name="desiredRoles" defaultValue="support" className="border border-red-400/20 bg-red-500/5 text-red-300/80 placeholder-red-400/40 font-mono text-xs sm:text-sm uppercase" placeholder="Roles requeridos (csv)" />
            <Input name="languages" defaultValue="es" className="border border-red-400/20 bg-red-500/5 text-red-300/80 placeholder-red-400/40 font-mono text-xs sm:text-sm uppercase" placeholder="Idiomas (csv)" />
            <Input name="expiresAt" type="datetime-local" className="border border-red-400/20 bg-red-500/5 text-red-300/80 placeholder-red-400/40 font-mono text-xs sm:text-sm uppercase" />
            <Button className="border border-red-400/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 font-black text-xs uppercase card-hover">Publicar</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-5 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {posts.map((post) => (
          <Card key={post.id} className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
            <CardHeader className="border-b border-red-400/20">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-xs sm:text-sm font-black uppercase tracking-widest text-red-400">{post.title}</CardTitle>
                <Badge className="bg-red-500/10 text-red-300/80 border border-red-400/20 font-black text-xs uppercase">{post.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm leading-5 text-red-300/80 font-mono uppercase">{post.description}</p>
              <div className="flex flex-wrap gap-2">
                {post.platforms.map((platform) => (
                  <Badge key={platform} variant="outline" className="border border-red-400/20 text-red-300/80 bg-red-500/5 font-black text-xs uppercase">
                    {platform}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-red-400/60 font-mono uppercase">Expira: {formatDateTime(post.expiresAt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
