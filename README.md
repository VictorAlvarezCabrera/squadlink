# SquadLink

SquadLink es una plataforma web multijuego para crear clanes, reclutar jugadores, gestionar eventos, publicar LFG, reportar contenido y recomendar clanes compatibles.

## Backend local

El proyecto queda orientado a ejecucion local. La persistencia vive en Docker y la estructura visible del repo usa naming neutro:

- `database/` para migraciones y seed
- `lib/backend/` para clientes del backend
- variables `NEXT_PUBLIC_BACKEND_*` y `BACKEND_*`

Internamente se conserva el stack de auth y RLS que ya usaba la app, pero no dependes de una cuenta cloud para desarrollar ni probar.

## Requisitos

- Node.js 20+
- npm
- Docker Desktop abierto

## Variables

1. Copia [`.env.example`](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/.env.example:1) a `.env`
2. `npm run local:up` sincroniza `.env.local` automaticamente para Next.js

Variables principales:

- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NEXT_PUBLIC_APP_MODE=local`
- `NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:55421`
- `NEXT_PUBLIC_BACKEND_ANON_KEY=...`
- `BACKEND_SERVICE_ROLE_KEY=...`
- `POSTGRES_PASSWORD=postgres`
- `JWT_SECRET=...`
- `LOCAL_DB_PORT=55432`
- `LOCAL_BACKEND_PORT=55421`

## Arranque

```bash
npm install
npm run local:up
npm run local:migrate
npm run local:seed
npm run dev
```

Servicios:

- App: [http://localhost:3000](http://localhost:3000)
- Backend gateway: [http://127.0.0.1:55421](http://127.0.0.1:55421)
- PostgreSQL: `postgresql://postgres:postgres@127.0.0.1:55432/postgres`
- Mailpit: [http://127.0.0.1:8025](http://127.0.0.1:8025)

## Scripts locales

- `npm run local:up`
- `npm run local:down`
- `npm run local:migrate`
- `npm run local:seed`
- `npm run local:reset`
- `npm run local:logs`

`local:migrate` ahora aplica solo migraciones pendientes usando una tabla `public.schema_migrations`, asi que no reintenta toda la historia en cada ejecucion.

## Estructura relevante

- [database/migrations](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/database/migrations:1)
- [database/seed/seed.sql](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/database/seed/seed.sql:1)
- [lib/backend](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/lib/backend:1)
- [docker-compose.yml](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/docker-compose.yml:1)
- [docker/nginx/backend.conf](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/docker/nginx/backend.conf:1)
- [scripts/local-stack.mjs](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/scripts/local-stack.mjs:1)

## Reset limpio

Si el entorno local queda roto:

```bash
npm run local:reset
npm run local:migrate
npm run local:seed
```

## Verificacion

```bash
docker compose ps
npm run lint
npm run typecheck
npm run test
npm run build
```
