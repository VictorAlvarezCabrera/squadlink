import { createClient } from "@supabase/supabase-js";

import { env, isBackendEnabled } from "@/lib/env";

export function createAdminBackendClient() {
  if (!isBackendEnabled || !env.backendServiceRoleKey) {
    return null;
  }

  return createClient(env.backendUrl, env.backendServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
