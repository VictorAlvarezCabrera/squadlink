import Link from "next/link";

import { getViewer } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

import { MobileNav } from "@/components/layout/mobile-nav";
import { LogoutButton } from "@/components/shared/logout-button";
import { Button } from "@/components/ui/button";

const navigation = [
  { href: "/clanes", label: "Clanes" },
  { href: "/eventos", label: "Eventos" },
  { href: "/lfg", label: "LFG" },
  { href: "/recomendaciones", label: "Compatibilidad" },
];

export async function SiteHeader() {
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-600/20">
              SL
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-200">SquadLink</p>
              <p className="text-xs text-zinc-400">Clanes, squads y eventos</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/10 hover:text-white"
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
              <Link href="/dashboard" className="hidden sm:block">
                <Button variant="outline" className="border-red-500/35 bg-red-500/10 text-white hover:bg-red-500/20">
                  Dashboard
                </Button>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden sm:block">
                <Button variant="outline" className="border-red-500/30 bg-transparent text-white hover:bg-red-500/15">
                  Entrar
                </Button>
              </Link>
              <Link href="/registro" className="hidden sm:block">
                <Button className="bg-red-500 text-white hover:bg-red-400">Crear cuenta</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
