import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { env, isBackendEnabled } from "@/lib/env";

export async function createServerBackendClient() {
  if (!isBackendEnabled) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.backendUrl, env.backendAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
