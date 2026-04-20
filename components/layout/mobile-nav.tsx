"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type NavigationItem = {
  href: string;
  label: string;
};

export function MobileNav({
  navigation,
  isAuthenticated,
}: {
  navigation: NavigationItem[];
  isAuthenticated: boolean;
}) {
  return (
    <div className="lg:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              aria-label="Abrir menu"
              className="border border-slate-300/25 bg-slate-900/70 text-slate-50 hover:border-cyan-300/60 hover:bg-cyan-300/10 font-medium card-hover"
            />
          }
        >
          <Menu className="size-4 sm:size-5" />
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full border-l border-slate-300/20 bg-slate-950/95 p-0 backdrop-blur-md sm:max-w-xs"
        >
          <SheetHeader className="border-b border-slate-300/20 px-4 py-3 sm:px-5 sm:py-4">
            <SheetTitle className="text-sm font-semibold text-cyan-100">Navegación</SheetTitle>
          </SheetHeader>

          <nav aria-label="Navegacion movil" className="space-y-1 sm:space-y-2 px-3 sm:px-4 py-4 sm:py-5">
            {navigation.map((item) => (
              <SheetClose
                key={item.href}
                render={
                  <Link
                    href={item.href}
                    className="block border border-slate-300/20 bg-slate-900/60 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10 hover:text-cyan-100 card-hover sm:px-4 sm:py-3"
                  />
                }
              >
                {item.label}
              </SheetClose>
            ))}
          </nav>

          <div className="mt-auto grid gap-2 border-t border-slate-300/20 px-3 py-4 sm:px-4 sm:py-5">
            {isAuthenticated ? (
              <>
                <SheetClose
                  render={
                    <Link
                      href="/me"
                      className="border border-cyan-300/50 bg-cyan-300/15 px-3 py-2 text-center text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/25 card-hover sm:px-4 sm:py-3"
                    />
                  }
                >
                  Mi perfil
                </SheetClose>
                <SheetClose
                  render={
                    <Link
                      href="/settings/profile"
                      className="border border-slate-300/20 bg-slate-900/60 px-3 py-2 text-center text-sm font-medium text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10 card-hover sm:px-4 sm:py-3"
                    />
                  }
                >
                  Ajustes
                </SheetClose>
              </>
            ) : (
              <>
                <SheetClose
                  render={
                    <Link
                      href="/login"
                      className="border border-slate-300/20 bg-slate-900/60 px-3 py-2 text-center text-sm font-medium text-slate-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/10 card-hover sm:px-4 sm:py-3"
                    />
                  }
                >
                  Entrar
                </SheetClose>
                <SheetClose
                  render={
                    <Link
                      href="/registro"
                      className="border border-cyan-300/50 bg-cyan-300/15 px-3 py-2 text-center text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/25 card-hover sm:px-4 sm:py-3"
                    />
                  }
                >
                  Crear cuenta
                </SheetClose>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
