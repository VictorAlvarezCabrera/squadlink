"use client";

import { createBrowserClient } from "@supabase/ssr";

import { env, isBackendEnabled } from "@/lib/env";

export function createBackendClient() {
  if (!isBackendEnabled) {
    return null;
  }

  return createBrowserClient(env.backendUrl, env.backendAnonKey);
}
