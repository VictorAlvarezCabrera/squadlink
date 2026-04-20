"use client";

import { useActionState } from "react";

import type { FormState } from "@/app/auth-actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({
  title,
  description,
  action,
  fields,
  submitLabel,
}: {
  title: string;
  description: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  fields: Array<{ name: string; label: string; type: string; placeholder: string }>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <Card className="border border-red-400/20 bg-red-500/5 text-red-300/80 card-hover">
      <CardHeader className="border-b border-red-400/20">
        <CardTitle className="text-lg sm:text-xl font-black uppercase tracking-widest text-red-400">{title}</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-red-400/60 font-mono uppercase">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form action={formAction} className="space-y-4">
          {fields.map((field) => (
            <div className="space-y-2" key={field.name}>
              <Label htmlFor={field.name} className="text-xs sm:text-sm text-red-400 font-black uppercase tracking-wider">
                {field.label}
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                className="border border-red-400/20 bg-red-500/5 text-red-300/80 placeholder-red-400/40 font-mono text-xs sm:text-sm uppercase focus:border-red-400/40 focus:ring-red-400/20"
              />
            </div>
          ))}
          {state.message ? (
            <div className="border border-red-400/30 bg-red-500/15 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-300/80 font-mono uppercase">
              {state.message}
            </div>
          ) : null}
          <Button type="submit" className="w-full border border-red-400/40 bg-red-500/15 text-red-300 hover:bg-red-500/25 font-black text-xs uppercase card-hover" disabled={pending}>
            {pending ? "PROCESANDO..." : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
