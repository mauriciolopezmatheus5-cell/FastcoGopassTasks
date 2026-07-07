# GopassTasks 🚀

Sistema de gestión de tareas por proyectos. Backend NestJS con arquitectura hexagonal, frontend React + Vite, base de datos PostgreSQL, y despliegue en AWS ECS Fargate.

---

## Prerrequisitos

- [Docker Desktop 4.x+](https://www.docker.com/products/docker-desktop/) con Docker Compose v2
- `curl` (para verificaciones)

---

## Inicio Rápido (3 pasos)

```bash
# 1. Configurar variables de entorno
cp .env.docker.example .env.docker

# 2. Construir e iniciar con datos de prueba
./scripts/start.sh --build --seed

# 3. Abrir la aplicación
open http://localhost:5173
```

---

## URLs del Entorno Local

| Servicio     | URL                              |
|---|---|
| 🌐 Frontend  | http://localhost:5173            |
| 🔧 API       | http://localhost:3000/api/v1     |
| 📚 Swagger   | http://localhost:3000/api/docs   |
| 🗄️ PostgreSQL | localhost:5432                   |
| ⚡ Redis      | localhost:6379                   |

**Usuario de prueba:** `admin@gopasstasks.com` / `Admin1234!`

---

## Comandos Útiles

```bash
# Iniciar (sin rebuild)
./scripts/start.sh

# Iniciar con rebuild de imágenes
./scripts/start.sh --build

# Iniciar con rebuild + seed de DB
./scripts/start.sh --build --seed

# Detener servicios (datos preservados)
./scripts/stop.sh

# Detener y eliminar volúmenes (borra datos)
./scripts/stop.sh --volumes

# Reiniciar DB desde cero + seed
./scripts/reset-db.sh

# Ver logs en tiempo real
docker compose logs -f api
docker compose logs -f web
docker compose logs -f postgres

# Estado de los servicios
docker compose ps
```

---

## Estructura del Proyecto

```
GopassTasks/
├── docker-compose.yml          ← Entorno de desarrollo local
├── docker-compose.prod.yml     ← Prueba local de imágenes de producción
├── .env.docker.example         ← Plantilla de variables (se commitea)
├── .env.docker                 ← Variables reales locales (.gitignore)
├── scripts/
│   ├── start.sh                ← Iniciar todos los servicios
│   ├── stop.sh                 ← Detener servicios [--volumes]
│   └── reset-db.sh             ← Reiniciar base de datos + seed
├── gopasstasks-api/            ← Backend NestJS (Arquitectura Hexagonal)
│   ├── Dockerfile              ← Multi-stage producción (ECS)
│   ├── Dockerfile.dev          ← Desarrollo con hot reload
│   └── src/
│       └── modules/
│           ├── auth/           ← Autenticación JWT + Cookies HttpOnly
│           ├── projects/       ← CRUD de proyectos + miembros
│           ├── tasks/          ← Gestión de tareas + estados + worklogs
│           └── users/          ← Perfil de usuario
└── gopasstasks-web/            ← Frontend React + Vite (Atomic Design)
    ├── Dockerfile              ← Multi-stage Nginx producción (ECS)
    ├── Dockerfile.dev          ← Desarrollo con HMR Vite
    └── nginx.conf              ← Config Nginx para SPA React Router
```

---

## Variables de Entorno

Copia `.env.docker.example` a `.env.docker` y configura:

| Variable           | Descripción                              | Requerida |
|--------------------|------------------------------------------|-----------|
| `POSTGRES_DB`      | Nombre de la base de datos               | ✅        |
| `POSTGRES_USER`    | Usuario de PostgreSQL                    | ✅        |
| `POSTGRES_PASSWORD`| Contraseña de PostgreSQL                 | ✅        |
| `REDIS_PASSWORD`   | Contraseña de Redis                      | ✅        |
| `JWT_SECRET`       | Secreto JWT (mínimo 32 caracteres)       | ✅        |
| `DATABASE_URL`     | URL completa de conexión (para prod)     | prod      |
| `FRONTEND_URL`     | URL del frontend (para CORS)             | prod      |
| `VITE_API_URL`     | URL base del API desde el frontend       | prod      |

> En **producción AWS**, estas variables se inyectan desde **AWS Secrets Manager** en la definición de tarea de ECS.

---

## Arquitectura

El backend sigue **Arquitectura Hexagonal (Ports & Adapters)**:

```
Input Adapters (Controllers) → Input Ports → Domain Core → Output Ports → Output Adapters (Prisma/Redis)
```

El frontend sigue **Atomic Design**:

```
Atoms → Molecules → Organisms → Templates → Pages
```

**Despliegue en producción:** AWS ECS Fargate con ALB, RDS PostgreSQL y ElastiCache Redis.

---

## API Endpoints Principales

```
POST /api/v1/auth/login          Iniciar sesión
POST /api/v1/auth/logout         Cerrar sesión
POST /api/v1/auth/register       Registrar usuario

GET  /api/v1/projects            Listar proyectos
POST /api/v1/projects            Crear proyecto
GET  /api/v1/projects/:id        Obtener proyecto
PATCH /api/v1/projects/:id       Actualizar proyecto
DELETE /api/v1/projects/:id      Eliminar proyecto

GET  /api/v1/projects/:id/tasks  Listar tareas del proyecto
POST /api/v1/tasks               Crear tarea
PATCH /api/v1/tasks/:id/status   Cambiar estado de tarea
POST /api/v1/tasks/:id/assign    Asignar miembro a tarea
POST /api/v1/tasks/:id/work-logs Registrar tiempo trabajado

GET  /api/v1/users/me            Perfil del usuario autenticado
GET  /api/health                 Health check (sin autenticación)
```

Documentación completa: **http://localhost:3000/api/docs**

---

## Probar Producción Localmente

```bash
# Construir imágenes de producción y probar
docker compose -f docker-compose.prod.yml up --build
```

Requiere `.env.docker` con `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` y `VITE_API_URL` configurados.

copilot --resume=a3420974-550a-4bc4-a5fd-c7f28888c1ac
