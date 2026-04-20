import Link from "next/link";

import { getViewer } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

import { MobileNav } from "@/components/layout/mobile-nav";
import { LogoutButton } from "@/components/shared/logout-button";
import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/home", label: "Inicio" },
  { href: "/players", label: "Jugadores" },
  { href: "/clanes", label: "Clanes" },
  { href: "/games", label: "Juegos" },
  { href: "/lfg", label: "Busco grupo (LFG)" },
  { href: "/notifications", label: "Notificaciones" },
];

export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300/20 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="flex size-8 sm:size-10 items-center justify-center border border-cyan-300/50 bg-cyan-300/15 text-cyan-100 text-xs sm:text-sm font-semibold group-hover:bg-cyan-300/25 group-hover:border-cyan-200/80 transition-all duration-200">
              SL
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold tracking-tight text-cyan-100 group-hover:text-cyan-50 transition-colors duration-200">SquadLink</p>
              <p className="text-xs text-slate-300/75">Red social gamer, clanes y stats enlazadas</p>
            </div>
          </Link>

          <nav aria-label="Secciones principales" className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "card-hover border border-slate-300/25 bg-slate-900/60 px-3 py-1.5 text-sm font-medium text-slate-100 hover:text-cyan-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <MobileNav navigation={navigation} isAuthenticated={Boolean(viewer)} />
          {viewer ? (
            <>
              <Link href="/me" className="hidden sm:block">
                <Button variant="outline" className="border border-cyan-300/50 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25 hover:border-cyan-200/80 text-sm font-medium transition-all duration-200">
                  Mi perfil
                </Button>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="outline" className="border border-slate-300/25 bg-slate-900/60 text-slate-100 hover:border-cyan-300/60 hover:bg-cyan-300/10 text-sm font-medium card-hover">
                  Entrar
                </Button>
              </Link>
              <Link href="/registro" className="hidden sm:block">
                <Button className="border border-cyan-300/50 bg-cyan-300/15 text-cyan-100 hover:bg-cyan-300/25 hover:border-cyan-200/80 text-sm font-medium card-hover">Crear cuenta</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
