# SquadLink

SquadLink es una plataforma web multijuego para crear clanes, reclutar jugadores, gestionar eventos, publicar LFG, reportar contenido y recomendar clanes compatibles.

## Estrategia local

El proyecto mantiene Supabase, pero ejecutado en local con Docker Compose. Se ha elegido esta vía porque la app ya depende de `@supabase/supabase-js`, `@supabase/ssr`, `auth.users`, RLS y PostgREST. Reescribir auth y permisos sobre PostgreSQL puro habría roto bastante más el repo.

El stack local levanta:

- PostgreSQL local con la imagen oficial de Supabase
- GoTrue para auth
- PostgREST para `/rest/v1`
- Nginx como gateway local para `/auth/v1` y `/rest/v1`
- Mailpit para correos de recuperación en desarrollo

## Requisitos previos

- Node.js 20+
- npm
- Docker Desktop abierto y completamente arrancado

## Archivo de variables que debes usar

El archivo canónico del entorno local es `/.env`.

Pasos:

1. Copia [`.env.example`](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/.env.example:1) a `.env`
2. Si usas `npm run local:up`, el script sincroniza automáticamente `/.env.local` con las variables compartidas que necesita Next.js

Notas:

- `docker compose up -d` leerá `/.env` automáticamente
- `npm run local:up` también usa `/.env` y falla con un mensaje claro si falta o tiene variables obligatorias vacías
- `/.env.local` sigue sirviendo para Next.js, pero ya no es el archivo base de Docker

## Variables principales

- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NEXT_PUBLIC_APP_MODE=supabase`
- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55421`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`
- `POSTGRES_PASSWORD=postgres`
- `JWT_SECRET=...`
- `JWT_EXPIRY=3600`
- `LOCAL_DB_PORT=55432`
- `LOCAL_SUPABASE_PORT=55421`
- `MAILPIT_SMTP_PORT=1025`
- `MAILPIT_UI_PORT=8025`

## Puertos por defecto

- App Next.js: `3000`
- Supabase gateway local: `55421`
- PostgreSQL local: `55432`
- Mailpit SMTP: `1025`
- Mailpit UI: `8025`

Se usan `55421/55432` por defecto para evitar choques frecuentes con otras instalaciones locales de Supabase, PostgreSQL o herramientas que ya ocupan el rango `5432x`.

## Arranque local

### Caso feliz

1. Abre Docker Desktop
2. Copia `/.env.example` a `/.env`
3. Ejecuta:

```bash
npm install
npm run local:up
npm run local:migrate
npm run local:seed
npm run dev
```

La app queda en:

- [http://localhost:3000](http://localhost:3000)

Servicios locales:

- gateway: [http://127.0.0.1:55421](http://127.0.0.1:55421)
- postgres: `postgresql://postgres:postgres@127.0.0.1:55432/postgres`
- mailpit: [http://127.0.0.1:8025](http://127.0.0.1:8025)

### Arranque directo con Docker Compose

Si prefieres no usar el script:

```bash
docker compose up -d --remove-orphans
npm run local:migrate
npm run local:seed
npm run dev
```

Esto funciona siempre que `/.env` exista y tenga las variables obligatorias.

## Qué hace `npm run local:up`

`local:up` ya no se limita a hacer `docker compose up`. Ahora hace esto:

1. valida `/.env`
2. sincroniza `/.env.local` para Next.js
3. comprueba que Docker Desktop responde
4. levanta `db` y `mailpit`
5. espera a que `db` esté healthy
6. aplica bootstrap SQL de roles/JWT para corregir contraseñas y permisos aunque el volumen ya existiera
7. levanta `auth` y `rest`
8. espera a que ambos estén healthy
9. levanta `gateway`

Esto evita varios fallos típicos en Windows:

- variables vacías o archivo incorrecto
- dependencias arrancando en orden malo
- volúmenes inicializados con credenciales antiguas
- orphans de ejecuciones previas

## Cómo comprobar que todo está healthy

### Estado de contenedores

```bash
docker compose ps
```

### Health del gateway

- [http://127.0.0.1:55421/health](http://127.0.0.1:55421/health)

### Ver logs

```bash
npm run local:logs
```

## Reset y recuperación

### Si el stack quedó roto

Usa:

```bash
npm run local:reset
```

`local:reset` hace:

- `docker compose down -v --remove-orphans`
- recrea `db`, `mailpit`, `auth`, `rest` y `gateway`

Después ejecuta:

```bash
npm run local:migrate
npm run local:seed
```

### Si solo quieres apagarlo

```bash
npm run local:down
```

## Auth local

La auth real sigue funcionando con Supabase Auth local:

- registro
- login
- logout
- sesión SSR persistente
- bootstrap automático de `profiles`
- recuperación de acceso

Los correos de recuperación salen a Mailpit:

- [http://127.0.0.1:8025](http://127.0.0.1:8025)

Por defecto:

- `AUTH_AUTO_CONFIRM=true`

## Migraciones y seed

Migraciones en orden:

- [supabase/migrations/20260417130000_init.sql](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/supabase/migrations/20260417130000_init.sql:1)
- [supabase/migrations/20260417143000_backend_real.sql](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/supabase/migrations/20260417143000_backend_real.sql:1)
- [supabase/migrations/20260420110000_auth_profile_bootstrap_hardening.sql](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/supabase/migrations/20260420110000_auth_profile_bootstrap_hardening.sql:1)

Seed:

- [supabase/seed/seed.sql](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/supabase/seed/seed.sql:1)

## Infraestructura local añadida

- [docker-compose.yml](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/docker-compose.yml:1)
- [docker/nginx/supabase.conf](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/docker/nginx/supabase.conf:1)
- [docker/db/bootstrap/00-local-bootstrap.sql](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/docker/db/bootstrap/00-local-bootstrap.sql:1)
- [docker/db/init/00-local-bootstrap.sh](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/docker/db/init/00-local-bootstrap.sh:1)
- [scripts/local-stack.mjs](/C:/Users/victor/Desktop/Proyecto%20DAW/SquadLink/scripts/local-stack.mjs:1)

## Scripts locales

- `npm run local:up`
- `npm run local:down`
- `npm run local:migrate`
- `npm run local:seed`
- `npm run local:reset`
- `npm run local:logs`

## Verificación del repo

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```
