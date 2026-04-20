import { formatReliability } from "@/lib/format";
import type { Profile } from "@/types/domain";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfilePage({ profile, editable = false }: { profile: Profile; editable?: boolean }) {
  return (
    <div className="space-y-8">
      <Card className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
        <CardHeader className="border-b border-red-400/20">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">Dossier Operacional</p>
              <CardTitle className="mt-2 text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-widest text-red-400">{profile.nick}</CardTitle>
              <p className="mt-3 max-w-2xl text-xs sm:text-sm text-red-300/80 font-mono uppercase">{profile.bio}</p>
            </div>
            {editable ? <Badge className="bg-red-500/10 text-red-300/80 border border-red-400/20 font-black text-xs uppercase whitespace-nowrap">Modo edición</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 sm:gap-6 lg:grid-cols-3 pt-6">
          <Info title="Idiomas de comunicación" values={profile.languages} />
          <Info title="Especialidades tácticas" values={profile.gameplayRoles} />
          <Info title="Ventanas operacionales" values={profile.availability.map((slot) => `${slot.day} ${slot.from}-${slot.to}`)} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-3">
        <Summary label="Plataforma primaria" value={profile.mainPlatform} />
        <Summary label="Clasificación táctica" value={formatReliability(profile.reliabilityScore)} />
        <Summary label="Zona horaria" value={profile.timezone} />
      </div>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
      <CardContent className="p-4 sm:p-6">
        <p className="text-xs sm:text-sm uppercase tracking-widest text-red-400 font-black">{label}</p>
        <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-black text-red-400 uppercase">{value}</p>
      </CardContent>
    </Card>
  );
}

function Info({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <p className="text-xs sm:text-sm uppercase tracking-widest font-black text-red-400">{title}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge key={value} variant="outline" className="border border-red-400/20 text-red-300/80 bg-red-500/5 font-black text-xs uppercase">
            {value}
          </Badge>
        ))}
      </div>
    </div>
  );
}
