# SquadLink - Plataforma para Encontrar Compañeros de Juego

Proyecto de fin de curso - 2º DAW

## Autores
- Víctor Álvarez Cabrera
- Fernando Mansilla Hidalgo

## Tecnologías
- Frontend: Flutter Web + Dart
- Backend: Node.js + Express
- Base de datos: MySQL 8.0
- Contenedorización: Docker + Docker Compose

## Requisitos Previos
- Docker Desktop
- Git

## Instalación y Uso

Clonar repositorio:
git clone https://github.com/TU-USUARIO/squadlink.git
cd squadlink

Levantar servicios:
docker compose up -d

Ver logs:
docker compose logs -f

Parar servicios:
docker compose down

## URLs de Desarrollo
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- MySQL: localhost:3306

## Estructura del Proyecto
squadlink/
├── backend/          (API REST con Node.js + Express)
├── frontend/         (Flutter Web)
├── docker-compose.yml
└── .env

## Estado del Proyecto
- [x] Configuración de Docker
- [x] Base de datos MySQL
- [x] Backend básico
- [ ] Sistema de autenticación
- [ ] CRUD de usuarios
- [ ] Integración APIs externas
- [ ] Frontend completo

