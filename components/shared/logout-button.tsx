"use client";

import { useTransition } from "react";

import { LogOut } from "lucide-react";

import { logoutAction } from "@/app/auth-actions";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      className="w-full justify-start border border-slate-300/20 bg-slate-900/50 text-slate-100 hover:border-cyan-300/50 hover:bg-cyan-300/10 hover:text-cyan-100 text-sm font-medium"
      onClick={() => startTransition(() => void logoutAction())}
      disabled={pending}
    >
      <LogOut className="size-3 sm:size-4" />
      {pending ? "Cerrando sesion..." : "Cerrar sesion"}
    </Button>
  );
}
