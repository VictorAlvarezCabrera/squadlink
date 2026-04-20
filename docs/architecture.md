# Arquitectura de SquadLink

## Capas

1. `app/`
   Rutas, layouts, server actions y route handlers.
2. `features/`
   Composicion visual por dominio.
3. `components/`
   UI reutilizable.
4. `services/`
   Casos de uso y agregacion de datos.
5. `lib/`
   Auth, clientes del backend, utilidades y compatibilidad.
6. `validations/`
   Esquemas Zod compartidos.
7. `database/`
   Migraciones SQL y seed.

## Decisiones

- SQL first para mantener el modelo defendible y controlable.
- Backend local reproducible con Docker.
- Demo mode separado para defensa academica.
- Compatibilidad jugador-clan en helper puro y testeable.
- Permisos replicados tanto en servidor como en RLS.
