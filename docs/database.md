# Base de datos

## Enfoque

Modelo relacional SQL-first para PostgreSQL local con RLS. `auth.users` representa identidad y `profiles` el perfil de aplicacion.

## Ubicacion

- [database/migrations](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/database/migrations:1)
- [database/seed/seed.sql](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/database/seed/seed.sql:1)

## Tablas base actuales

- `profiles`
- `games`
- `platforms`
- `profile_languages`
- `profile_games`
- `user_availability`
- `clans`
- `clan_roles`
- `clan_members`
- `clan_join_requests`
- `clan_invitations`
- `events`
- `event_attendees`
- `lfg_posts`
- `lfg_platforms`
- `lfg_languages`
- `reviews`
- `reports`
- `notifications`

## Tablas nuevas alineadas con PDF

Migracion: [20260420153000_pdf_social_stats_foundation.sql](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/database/migrations/20260420153000_pdf_social_stats_foundation.sql:1)

- `app_roles`
- `user_app_roles`
- `media_assets`
- `supported_games`
- `game_api_sources`
- `profile_platforms`
- `profile_roles`
- `profile_availability`
- `linked_game_accounts`
- `game_stat_snapshots`
- `game_stat_entries`
- `follows`
- `posts`
- `post_media`
- `post_comments`
- `post_likes`
- `clan_games`
- `clan_events`
- `clan_event_attendees`
- `lfg_responses`
- `compatibility_cache`
- `moderation_actions`
- `audit_logs`

## Nota de transicion

Ahora mismo conviven dos capas:

- modelo inicial del proyecto, ya usado por app actual
- capa nueva alineada con PDF funcional cerrado

Siguiente paso tecnico recomendado: mover servicios/frontend al nuevo bloque (`supported_games`, `posts`, `follows`, `linked_game_accounts`, `clan_events`) y retirar dependencias gradualmente del esquema antiguo donde haya solape.
