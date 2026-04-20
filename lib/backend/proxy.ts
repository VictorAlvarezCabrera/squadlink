import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { env, isBackendEnabled } from "@/lib/env";

export function createProxyBackendClient(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  if (!isBackendEnabled) {
    return { supabase: null, response };
  }

  const supabase = createServerClient(env.backendUrl, env.backendAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  return { supabase, response };
}
