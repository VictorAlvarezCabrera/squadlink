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
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              aria-label="Abrir menu de navegacion"
              className="border-red-500/40 bg-red-500/10 text-white hover:bg-red-500/20"
            />
          }
        >
          <Menu />
        </SheetTrigger>

        <SheetContent
          side="right"
          className="border-l border-red-500/30 bg-gradient-to-b from-zinc-950 via-black to-zinc-950 p-0"
        >
          <SheetHeader className="border-b border-white/10 px-5 py-4">
            <SheetTitle className="text-base uppercase tracking-[0.2em] text-red-200">SquadLink</SheetTitle>
          </SheetHeader>

          <nav className="space-y-2 px-4 py-5">
            {navigation.map((item) => (
              <SheetClose
                key={item.href}
                render={
                  <Link
                    href={item.href}
                    className="block rounded-xl border border-transparent bg-white/5 px-4 py-3 text-sm text-zinc-200 transition hover:border-red-500/35 hover:bg-red-500/10 hover:text-white"
                  />
                }
              >
                {item.label}
              </SheetClose>
            ))}
          </nav>

          <div className="mt-auto grid gap-2 border-t border-white/10 px-4 py-5">
            {isAuthenticated ? (
              <>
                <SheetClose
                  render={
                    <Link
                      href="/dashboard"
                      className="rounded-xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-red-500/20"
                    />
                  }
                >
                  Dashboard
                </SheetClose>
                <SheetClose
                  render={
                    <Link
                      href="/ajustes"
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm text-zinc-200 transition hover:border-red-500/30 hover:bg-red-500/10"
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
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-sm text-zinc-200 transition hover:border-red-500/30 hover:bg-red-500/10"
                    />
                  }
                >
                  Entrar
                </SheetClose>
                <SheetClose
                  render={
                    <Link
                      href="/registro"
                      className="rounded-xl border border-red-500/35 bg-red-500 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-red-400"
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
