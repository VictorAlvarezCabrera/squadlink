"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { findDemoProfileForCredentials } from "@/lib/auth/session";
import { demoAuthCookie } from "@/lib/constants";
import { env, isDemoMode } from "@/lib/env";
import { createServerBackendClient } from "@/lib/backend/server";
import { bootstrapProfile, isNickAvailable } from "@/services/profile-service";
import { loginSchema, recoverAccessSchema, registerSchema } from "@/validations/auth";

export interface FormState {
  success?: boolean;
  message?: string;
}

export async function loginAction(_previousState: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message };
  }

  if (isDemoMode) {
    const profile = findDemoProfileForCredentials(parsed.data.email, parsed.data.password);
    if (!profile) {
      return { success: false, message: "Credenciales demo incorrectas." };
    }

    const cookieStore = await cookies();
    cookieStore.set(demoAuthCookie, profile.id, { httpOnly: true, sameSite: "lax", path: "/" });
    redirect("/dashboard");
  }

  const supabase = await createServerBackendClient();
  if (!supabase) {
    return { success: false, message: "Supabase no esta configurado." };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { success: false, message: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await bootstrapProfile({
      userId: user.id,
      email: user.email ?? parsed.data.email,
      userMetadata: user.user_metadata ?? {},
    });
  }

  redirect("/dashboard");
}

export async function registerAction(_previousState: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    nick: formData.get("nick"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message };
  }

  if (isDemoMode) {
    const cookieStore = await cookies();
    cookieStore.set(demoAuthCookie, "profile_newcomer", { httpOnly: true, sameSite: "lax", path: "/" });
    redirect("/dashboard");
  }

  const supabase = await createServerBackendClient();
  if (!supabase) {
    return { success: false, message: "Supabase no esta configurado." };
  }

  const nickAvailable = await isNickAvailable(parsed.data.nick);
  if (!nickAvailable) {
    return { success: false, message: "Ese nick ya esta en uso." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        nick: parsed.data.nick,
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  if (data.user) {
    await bootstrapProfile({
      userId: data.user.id,
      email: data.user.email ?? parsed.data.email,
      userMetadata: {
        ...(data.user.user_metadata ?? {}),
        nick: parsed.data.nick,
      },
    });
  }

  if (data.session) {
    redirect("/dashboard");
  }

  return { success: true, message: "Cuenta creada. Revisa tu correo para confirmar el acceso." };
}

export async function recoverAccessAction(_previousState: FormState, formData: FormData): Promise<FormState> {
  const parsed = recoverAccessSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message };
  }

  if (isDemoMode) {
    return { success: true, message: "Modo demo: se simula el envio del correo de recuperacion." };
  }

  const supabase = await createServerBackendClient();
  if (!supabase) {
    return { success: false, message: "Supabase no esta configurado." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.appUrl}/login`,
  });
  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Revisa tu correo para continuar." };
}

export async function logoutAction() {
  if (isDemoMode) {
    const cookieStore = await cookies();
    cookieStore.delete(demoAuthCookie);
    redirect("/");
  }

  const supabase = await createServerBackendClient();
  await supabase?.auth.signOut();
  redirect("/");
}
