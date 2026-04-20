export type IntegrationState = "approved" | "approved_limited" | "catalog_only" | "out_of_scope";

export interface SupportedIntegration {
  slug: string;
  gameName: string;
  provider: string;
  auth: string;
  type: "catalog" | "stats";
  state: IntegrationState;
  summary: string;
  metrics: string[];
  notes: string;
}

export const supportedIntegrations: SupportedIntegration[] = [
  {
    slug: "rawg-catalog",
    gameName: "Catalogo general",
    provider: "RAWG",
    auth: "API key",
    type: "catalog",
    state: "catalog_only",
    summary: "Puebla catalogo, portada, generos, plataformas y metadatos del juego.",
    metrics: ["nombre", "cover", "slug", "plataformas"],
    notes: "Aprobado para MVP con atribucion. No enlaza cuentas de jugador.",
  },
  {
    slug: "league-of-legends",
    gameName: "League of Legends",
    provider: "Riot Games API",
    auth: "API key / app registrada",
    type: "stats",
    state: "approved",
    summary: "Cuenta, rank, historial reciente y resumen competitivo.",
    metrics: ["summoner", "rank", "winrate", "ultimas partidas"],
    notes: "API oficial. Development keys sirven para prototipo, pero caducan rapido.",
  },
  {
    slug: "teamfight-tactics",
    gameName: "Teamfight Tactics",
    provider: "Riot Games API",
    auth: "API key / app registrada",
    type: "stats",
    state: "approved",
    summary: "Rank, partidas recientes y actividad competitiva de TFT.",
    metrics: ["summoner", "tier", "lp", "recent matches"],
    notes: "Endpoints oficiales especificos para TFT.",
  },
  {
    slug: "valorant",
    gameName: "Valorant",
    provider: "Riot Games API",
    auth: "API key / app registrada",
    type: "stats",
    state: "approved",
    summary: "Matchlist, detalles de partida y resumen competitivo visible en perfil.",
    metrics: ["handle", "rank", "kda", "ultimas partidas"],
    notes: "API oficial viable para MVP competitivo resumido.",
  },
  {
    slug: "destiny-2",
    gameName: "Destiny 2",
    provider: "Bungie.Net API",
    auth: "API key y OAuth cuando aplique",
    type: "stats",
    state: "approved",
    summary: "Perfiles, personajes, progreso y resumen de actividad de Destiny 2.",
    metrics: ["bungie name", "power", "personajes", "actividad reciente"],
    notes: "Para datos privados se requieren scopes OAuth adecuados.",
  },
  {
    slug: "steam",
    gameName: "Steam",
    provider: "Steam Web API",
    auth: "API key",
    type: "stats",
    state: "approved_limited",
    summary: "Biblioteca, horas jugadas, logros y stats si juego y perfil lo permiten.",
    metrics: ["owned games", "playtime", "achievements", "user stats"],
    notes: "Soporte con limites: depende de perfil visible y de exposicion por juego.",
  },
];

export function getIntegrationByGameSlug(slug: string) {
  return supportedIntegrations.find((integration) => integration.slug === slug) ?? null;
}
