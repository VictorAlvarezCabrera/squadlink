const appMode = process.env.NEXT_PUBLIC_APP_MODE ?? "demo";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const backendAnonKey = process.env.NEXT_PUBLIC_BACKEND_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const backendServiceRoleKey = process.env.BACKEND_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  appMode,
  backendUrl,
  backendAnonKey,
  backendServiceRoleKey,
};

export const isBackendEnabled =
  ["local", "backend", "supabase"].includes(appMode) &&
  Boolean(env.backendUrl && env.backendAnonKey);

export const isSupabaseEnabled = isBackendEnabled;

export const isDemoMode = !isBackendEnabled;
