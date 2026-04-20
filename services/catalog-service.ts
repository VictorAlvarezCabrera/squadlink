import { AppError } from "@/lib/app-error";
import type { Game, Platform } from "@/types/domain";

import {
  assertAdmin,
  createAdminBackendClient,
  demoCatalog,
  getCatalogRows,
  isDemoMode,
  mapGame,
  mapPlatform,
} from "@/services/_shared";

export async function getCatalog(): Promise<{ games: Game[]; platforms: Platform[] }> {
  if (isDemoMode) {
    return demoCatalog;
  }

  const rows = await getCatalogRows();
  return {
    games: rows?.games.map(mapGame) ?? [],
    platforms: rows?.platforms.map(mapPlatform) ?? [],
  };
}

export async function searchGames(query: string) {
  const term = query.trim().toLowerCase();
  if (!term) {
    return [];
  }

  const catalog = await getCatalog();
  return catalog.games.filter((game) => game.name.toLowerCase().includes(term) || game.slug.includes(term));
}

export async function getGameBySlug(slug: string) {
  const catalog = await getCatalog();
  return catalog.games.find((game) => game.slug === slug) ?? null;
}

export async function syncGameCatalog(query: string) {
  await assertAdmin();

  const admin = createAdminBackendClient();
  if (!admin) {
    throw new AppError("Service role del backend no configurada.", 500);
  }

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    throw new AppError("RAWG_API_KEY no configurada.", 500);
  }

  const url = new URL("https://api.rawg.io/api/games");
  url.searchParams.set("search", query);
  url.searchParams.set("page_size", "10");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) {
    throw new AppError("No se pudo sincronizar el catálogo de juegos.", 502);
  }

  const payload = (await response.json()) as {
    results?: Array<{
      id: number;
      name: string;
      slug: string;
      background_image: string | null;
      released: string | null;
    }>;
  };

  const rows = (payload.results ?? []).map((game) => ({
    rawg_id: game.id,
    name: game.name,
    slug: game.slug,
    genre: "External Catalog",
    cover_url: game.background_image,
    background_image: game.background_image,
    released_at: game.released,
    last_synced_at: new Date().toISOString(),
  }));

  if (rows.length) {
    await admin.from("games").upsert(rows, { onConflict: "slug" });
  }

  return searchGames(query);
}

export async function getGameOffers(slug: string) {
  const baseUrl = process.env.CHEAPSHARK_BASE_URL ?? "https://www.cheapshark.com/api/1.0";
  const game = (await searchGames(slug))[0];

  if (!game) {
    return [];
  }

  const response = await fetch(`${baseUrl}/deals?title=${encodeURIComponent(game.name)}&pageSize=5`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return [];
  }

  return (await response.json()) as Array<Record<string, unknown>>;
}
