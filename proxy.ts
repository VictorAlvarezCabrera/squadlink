import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { adminRoutes, demoAuthCookie, protectedRoutes } from "@/lib/constants";
import { isDemoMode } from "@/lib/env";
import { createProxyBackendClient } from "@/lib/backend/proxy";

function matchesRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsProtection = matchesRoute(pathname, protectedRoutes);

  if (!needsProtection) {
    return NextResponse.next();
  }

  if (isDemoMode) {
    const viewer = request.cookies.get(demoAuthCookie)?.value;
    if (!viewer) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (matchesRoute(pathname, adminRoutes) && viewer !== "profile_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  const { supabase, response } = createProxyBackendClient(request);
  if (!supabase) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (matchesRoute(pathname, adminRoutes)) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle<{ role: string }>();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|api/health).*)"],
};
