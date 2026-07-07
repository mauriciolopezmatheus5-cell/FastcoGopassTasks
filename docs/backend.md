# GopassTasks API — Documentación Backend

> **Versión:** 1.0  
> **Framework:** NestJS 11  
> **Lenguaje:** TypeScript 5.7 (strict mode)  
> **Carpeta de trabajo:** `gopasstasks-api/`

---

## Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Módulos del Sistema](#módulos-del-sistema)
4. [Base de Datos](#base-de-datos)
5. [Endpoints de la API](#endpoints-de-la-api)
6. [Autenticación y Seguridad](#autenticación-y-seguridad)
7. [Paquetes Utilizados](#paquetes-utilizados)
8. [Variables de Entorno](#variables-de-entorno)
9. [Cómo Correr el Proyecto](#cómo-correr-el-proyecto)
10. [Documentación Swagger](#documentación-swagger)
11. [Testing](#testing)

---

## Arquitectura

El backend implementa **Arquitectura Hexagonal (Ports & Adapters)** con Clean Architecture. El dominio nunca depende de frameworks externos; las capas externas dependen del dominio.

```
Input Adapters → Input Ports → Domain Core → Output Ports → Output Adapters
(Controllers)                  (Use Cases)                  (Prisma/Redis)
```

### Capas

| Capa | Responsabilidad | Ejemplo |
|------|----------------|---------|
| **Input Adapters** | Traducen HTTP → dominio | `ProjectController`, `AuthController` |
| **Application** | Orquestan casos de uso | `CreateProjectUseCase`, `LoginUseCase` |
| **Domain** | Entidades, Value Objects, contratos | `Task`, `TaskStatus`, `IProjectRepository` |
| **Output Adapters** | Implementan puertos con Prisma | `PrismaProjectRepository`, `PrismaUserRepository` |

### Principios aplicados

- **SOLID** — Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
- **Defensive Programming** — Guard clauses, Fail Fast, nunca confiar en datos externos
- **Clean Code** — Nombres descriptivos, funciones pequeñas, sin números mágicos
- **Fail Fast en configuración** — Si falta una variable de entorno crítica, la app no arranca

---

## Estructura de Carpetas

```
gopasstasks-api/
├── src/
│   ├── main.ts                    ← Punto de entrada, configuración global
│   ├── app.module.ts              ← Módulo raíz con validación de env (Joi)
│   ├── modules/
│   │   ├── auth/                  ← Autenticación JWT + Cookies HttpOnly
│   │   │   ├── application/
│   │   │   │   ├── dtos/          ← LoginDto, RegisterDto
│   │   │   │   └── use-cases/     ← LoginUseCase, RegisterUseCase
│   │   │   ├── domain/
│   │   │   │   ├── entities/      ← User entity
│   │   │   │   ├── ports/         ← IUserRepository
│   │   │   │   └── value-objects/ ← UserRole
│   │   │   └── infrastructure/
│   │   │       └── adapters/
│   │   │           ├── input/     ← AuthController, JwtStrategy
│   │   │           └── output/    ← PrismaUserRepository
│   │   ├── projects/              ← Gestión de proyectos y miembros
│   │   │   ├── application/
│   │   │   │   ├── dtos/          ← CreateProjectDto, ProjectResponseDto, etc.
│   │   │   │   └── use-cases/     ← 8 casos de uso (CRUD + miembros)
│   │   │   ├── domain/
│   │   │   │   ├── entities/      ← Project entity
│   │   │   │   └── ports/         ← IProjectRepository
│   │   │   └── infrastructure/
│   │   │       └── adapters/
│   │   │           ├── input/     ← ProjectController
│   │   │           └── output/    ← PrismaProjectRepository
│   │   ├── tasks/                 ← Gestión de tareas, estados, worklogs
│   │   │   ├── application/
│   │   │   │   ├── dtos/          ← CreateTaskDto, TaskResponseDto, etc.
│   │   │   │   └── use-cases/     ← 10 casos de uso
│   │   │   ├── domain/
│   │   │   │   ├── entities/      ← Task entity
│   │   │   │   ├── ports/         ← ITaskRepository
│   │   │   │   └── value-objects/ ← TaskStatus, Priority
│   │   │   └── infrastructure/
│   │   │       └── adapters/
│   │   │           ├── input/     ← TaskController, ProjectTasksController
│   │   │           └── output/    ← PrismaTaskRepository
│   │   ├── users/                 ← Perfil del usuario autenticado
│   │   └── admin/                 ← Administración de usuarios y roles
│   └── shared/
│       ├── domain/
│       │   └── exceptions/        ← DomainException, RecursoNoEncontradoException, etc.
│       ├── guards/                ← JwtAuthGuard, RolesGuard, roles.decorator.ts
│       └── infrastructure/
│           ├── database/          ← PrismaService (OnModuleInit/Destroy)
│           ├── filters/           ← GlobalExceptionFilter
│           └── health/            ← HealthController (/api/health)
├── prisma/
│   ├── schema.prisma              ← Esquema de la base de datos
│   ├── seed.ts                    ← Datos iniciales (roles + usuario admin)
│   └── migrations/                ← Migraciones versionadas de Prisma
├── test/
│   └── *.e2e-spec.ts              ← Pruebas end-to-end
├── Dockerfile                     ← Multi-stage producción (AWS ECS)
├── Dockerfile.dev                 ← Desarrollo con hot reload
├── .env                           ← Variables de entorno locales
└── package.json
```

---

## Módulos del Sistema

### Auth (`/api/v1/auth`)

Gestiona registro, login y sesión de usuarios mediante JWT almacenado en cookie HttpOnly.

**Casos de uso:**
- `LoginUseCase` — valida credenciales, genera JWT, establece cookie
- `RegisterUseCase` — crea usuario con bcrypt (hash `rounds=12`), asigna rol `DEVELOPER`

**Estrategia JWT:** `passport-jwt` extrae el token de la cookie `access_token`.

---

### Projects (`/api/v1/projects`)

CRUD completo de proyectos con gestión de miembros.

**Casos de uso:**
| Caso de uso | Descripción |
|---|---|
| `CreateProjectUseCase` | Crea proyecto y asigna al creador como `ADMIN` |
| `GetProjectsUseCase` | Lista proyectos donde el usuario es miembro |
| `GetProjectByIdUseCase` | Obtiene proyecto (requiere ser miembro) |
| `UpdateProjectUseCase` | Actualiza nombre/descripción (requiere ser `ADMIN`) |
| `DeleteProjectUseCase` | Elimina proyecto en cascada (requiere ser `ADMIN`) |
| `AddProjectMemberUseCase` | Agrega miembro con rol `MEMBER` (requiere ser `ADMIN`) |
| `RemoveProjectMemberUseCase` | Remueve miembro; no puede remover el último `ADMIN` |
| `GetProjectMembersUseCase` | Lista miembros del proyecto |

---

### Tasks (`/api/v1/tasks`)

Gestión completa de tareas con máquina de estados, asignaciones y registro de tiempo.

**Casos de uso:**
| Caso de uso | Descripción |
|---|---|
| `CreateTaskUseCase` | Crea tarea (requiere ser miembro del proyecto) |
| `GetTasksByProjectUseCase` | Lista tareas con filtros por `status` y `priority` |
| `GetTaskByIdUseCase` | Obtiene tarea (requiere ser miembro del proyecto) |
| `UpdateTaskUseCase` | Actualiza tarea (no permitido si está `APROBADO`) |
| `DeleteTaskUseCase` | Elimina tarea (`ADMIN` del proyecto o creador) |
| `ChangeTaskStatusUseCase` | Cambia estado con validación de transiciones |
| `AssignTaskMemberUseCase` | Asigna usuario (debe ser miembro del proyecto) |
| `UnassignTaskMemberUseCase` | Desasigna usuario de la tarea |
| `LogWorkUseCase` | Registra tiempo trabajado (en minutos) |
| `GetWorkLogsUseCase` | Lista registros de trabajo de una tarea |

**Matriz de transiciones de estado:**

```
BACKLOG     → EN_PROGRESO
EN_PROGRESO → PRUEBAS_QA, BACKLOG
PRUEBAS_QA  → EN_PROGRESO, LISTO
LISTO       → APROBADO, EN_PROGRESO
APROBADO    → (ninguna — estado final)
```

---

### Shared

- **`GlobalExceptionFilter`** — Centraliza todos los errores con mensajes en español. Cubre `HttpException`, errores de Prisma (P2002→409, P2025→404, P2003→400, P2014→400) y errores 5xx.
- **`JwtAuthGuard`** — Guard que extrae y valida el JWT de la cookie HttpOnly.
- **`RolesGuard`** — Verifica el rol del usuario para rutas restringidas.
- **`PrismaService`** — Extiende `PrismaClient` con ciclo de vida de NestJS.
- **`HealthController`** — Endpoint `/api/health` sin autenticación para health checks de Docker/ECS.

---

## Base de Datos

**Motor:** PostgreSQL 16  
**ORM:** Prisma 6

### Diagrama de Entidades

```
User ──── Role
 │
 ├──(m:m)── Project   (via ProjectMember: userId, projectId, role)
 │
 └──(m:m)── Task      (via TaskMember: taskId, userId)
              │
              ├── TaskWorkLog     (registro de tiempo)
              └── TaskDescriptionHistory (historial al aprobar)
```

### Modelos Prisma

| Modelo | Tabla | Descripción |
|---|---|---|
| `User` | `users` | Usuario del sistema con `isActive`, `roleId` |
| `Role` | `roles` | Rol global: `ADMIN`, `DEVELOPER`, `VIEWER` |
| `Project` | `projects` | Proyecto con nombre y descripción |
| `ProjectMember` | `project_members` | Relación usuario-proyecto con rol (`ADMIN`/`MEMBER`) |
| `Task` | `tasks` | Tarea con estado, prioridad (-100 a 100), fechas |
| `TaskMember` | `task_members` | Asignación de usuarios a tareas |
| `TaskWorkLog` | `task_work_logs` | Registro de tiempo trabajado en minutos |
| `TaskDescriptionHistory` | `task_description_history` | Historial de descripción al aprobar |

### Enum `TaskStatus`

```
BACKLOG | EN_PROGRESO | PRUEBAS_QA | LISTO | APROBADO
```

---

## Endpoints de la API

Base URL: `http://localhost:3000/api/v1`

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/auth/login` | Iniciar sesión → cookie JWT | ❌ |
| `POST` | `/auth/logout` | Cerrar sesión → limpia cookie | ❌ |
| `POST` | `/auth/register` | Registrar nuevo usuario | ❌ |
| `GET`  | `/auth/me` | Datos del usuario autenticado | ✅ |

### Proyectos

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET`    | `/projects` | Listar proyectos del usuario | ✅ |
| `POST`   | `/projects` | Crear proyecto | ✅ |
| `GET`    | `/projects/:id` | Obtener proyecto por ID | ✅ |
| `PATCH`  | `/projects/:id` | Actualizar proyecto | ✅ ADMIN |
| `DELETE` | `/projects/:id` | Eliminar proyecto | ✅ ADMIN |
| `GET`    | `/projects/:id/members` | Listar miembros | ✅ |
| `POST`   | `/projects/:id/members` | Agregar miembro | ✅ ADMIN |
| `DELETE` | `/projects/:id/members/:userId` | Remover miembro | ✅ ADMIN |
| `GET`    | `/projects/:id/tasks` | Listar tareas del proyecto | ✅ |

### Tareas

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST`   | `/tasks` | Crear tarea | ✅ |
| `GET`    | `/tasks/:id` | Obtener tarea | ✅ |
| `PATCH`  | `/tasks/:id` | Actualizar tarea | ✅ |
| `DELETE` | `/tasks/:id` | Eliminar tarea | ✅ |
| `PATCH`  | `/tasks/:id/status` | Cambiar estado | ✅ |
| `POST`   | `/tasks/:id/assign` | Asignar usuario | ✅ |
| `DELETE` | `/tasks/:id/assign/:userId` | Desasignar usuario | ✅ |
| `POST`   | `/tasks/:id/work-logs` | Registrar tiempo | ✅ |
| `GET`    | `/tasks/:id/work-logs` | Listar work logs | ✅ |

### Otros

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/users/me` | Perfil del usuario | ✅ |
| `PATCH` | `/users/me` | Actualizar nombre | ✅ |
| `GET` | `/api/health` | Health check | ❌ |

---

## Autenticación y Seguridad

### JWT en Cookie HttpOnly

```
POST /auth/login → res.cookie('access_token', jwt, {
  httpOnly: true,   // Protección XSS
  secure: false,    // true en producción (HTTPS)
  sameSite: 'lax',
  maxAge: 3600000,  // 1 hora
  path: '/'
})
```

El cliente **no necesita manejar el token manualmente**; el navegador lo envía automáticamente con cada request gracias a `withCredentials: true` en Axios.

### Capas de Seguridad en `main.ts`

| Capa | Paquete | Propósito |
|------|---------|-----------|
| `helmet()` | `helmet` | Cabeceras HTTP seguras (XSS, Clickjacking) |
| `cookieParser()` | `cookie-parser` | Lectura de cookies HttpOnly |
| CORS restrictivo | NestJS built-in | Solo acepta requests del `FRONTEND_URL` |
| `ValidationPipe` | `class-validator` | `whitelist: true`, `forbidNonWhitelisted: true` |
| `GlobalExceptionFilter` | Custom | Errores estandarizados en español |
| `JwtAuthGuard` | `passport-jwt` | Verifica JWT en cookie |

---

## Paquetes Utilizados

### Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `@nestjs/core` | ^11.0.1 | Framework principal |
| `@nestjs/common` | ^11.0.1 | Decoradores, pipes, guards |
| `@nestjs/config` | ^4.0.4 | Variables de entorno tipadas |
| `@nestjs/jwt` | ^11.0.2 | Generación y verificación de JWT |
| `@nestjs/passport` | ^11.0.5 | Integración con Passport.js |
| `@nestjs/swagger` | ^11.4.1 | Documentación OpenAPI automática |
| `@nestjs/terminus` | ^11.1.1 | Health checks |
| `@prisma/client` | ^6.19.3 | Cliente ORM generado |
| `passport-jwt` | ^4.0.1 | Estrategia JWT para Passport |
| `bcrypt` | ^6.0.0 | Hash de contraseñas |
| `class-validator` | ^0.15.1 | Validación de DTOs |
| `class-transformer` | ^0.5.1 | Transformación JSON → clase |
| `helmet` | ^8.1.0 | Seguridad de cabeceras HTTP |
| `cookie-parser` | ^1.4.7 | Parseo de cookies |
| `joi` | ^18.1.2 | Validación de esquema de env |
| `uuid` | ^14.0.0 | Generación de IDs únicos |
| `rxjs` | ^7.8.1 | Programación reactiva (NestJS core) |

### Desarrollo

| Paquete | Propósito |
|---------|-----------|
| `prisma` | CLI para migraciones y generación del cliente |
| `ts-jest` | Transformador TypeScript para Jest |
| `supertest` | Pruebas HTTP end-to-end |
| `@nestjs/testing` | Módulo de testing de NestJS |
| `@nestjs/cli` | CLI para generar módulos/controladores |
| `typescript-eslint` | Reglas ESLint para TypeScript |
| `prettier` | Formateador de código |

---

## Variables de Entorno

Archivo: `gopasstasks-api/.env`

```env
# Servidor
NODE_ENV=development
PORT=3000

# Base de Datos PostgreSQL
DATABASE_URL=postgresql://gopass:gopass_secret@localhost:5432/gopasstasks

# JWT (mínimo 32 caracteres)
JWT_SECRET=local_dev_jwt_secret_minimum_32_chars_ok

# CORS - URL del frontend
FRONTEND_URL=http://localhost:5173
```

> **Producción:** Las variables sensibles se inyectan desde **AWS Secrets Manager** en la definición de tarea de ECS.

---

## Cómo Correr el Proyecto

### Con Docker (recomendado)

```bash
# Desde la raíz del monorepo
cp .env.docker.example .env.docker

# Primera vez (construye imágenes + aplica migraciones + seed)
./scripts/start.sh --build --seed

# Inicios siguientes (sin rebuild)
./scripts/start.sh

# Detener
./scripts/stop.sh
```

### Modo Desarrollo Local (sin Docker)

**Prerrequisitos:** Node.js 20+, PostgreSQL 16 corriendo localmente.

```bash
cd gopasstasks-api

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con DATABASE_URL, JWT_SECRET, etc.

# 3. Aplicar migraciones de base de datos
npx prisma migrate dev

# 4. Ejecutar seed (roles + usuario admin)
npx prisma db seed

# 5. Iniciar en modo desarrollo (hot reload)
npm run start:dev
```

La API quedará disponible en `http://localhost:3000/api/v1`.

### Scripts disponibles

```bash
npm run start:dev    # Desarrollo con hot reload (--watch)
npm run start:debug  # Modo debug con inspector Node.js
npm run build        # Compilar a JavaScript (dist/)
npm run start:prod   # Producción desde dist/
npm run lint         # ESLint con auto-fix
npm run format       # Prettier
npm run test         # Jest (unit tests)
npm run test:watch   # Jest en modo watch
npm run test:cov     # Jest con cobertura de código
npm run test:e2e     # Pruebas end-to-end con Supertest
```

### Comandos de Prisma

```bash
# Crear una nueva migración
npx prisma migrate dev --name <nombre>

# Aplicar migraciones en producción
npx prisma migrate deploy

# Ver la base de datos en el explorador web
npx prisma studio

# Regenerar el cliente Prisma (tras cambios en schema.prisma)
npx prisma generate

# Ejecutar seed
npx prisma db seed

# Reiniciar la base de datos (destructivo)
npx prisma migrate reset
```

---

## Documentación Swagger

**URL:** `http://localhost:3000/api/docs`

La documentación se genera automáticamente con **Swagger/OpenAPI 3.0** usando decoradores de NestJS (`@ApiTags`, `@ApiOperation`, `@ApiResponse`).

### Autenticación en Swagger

1. Hacer `POST /api/v1/auth/login` con credenciales válidas.
2. La cookie `access_token` queda establecida en el navegador automáticamente.
3. Los endpoints protegidos funcionarán sin pasos adicionales.

**Usuario de prueba (seed):**
- Email: `admin@gopasstasks.com`
- Password: `Admin1234!`

### Tags disponibles

| Tag | Descripción |
|-----|-------------|
| `Autenticación` | Login, logout, registro, perfil |
| `Proyectos` | CRUD de proyectos y gestión de miembros |
| `Tareas` | CRUD de tareas, estados, asignaciones, work logs |
| `Admin` | Administración de usuarios y roles |
| `Health` | Estado del servicio |

---

## Testing

### Estructura de Tests

```
src/
└── **/*.spec.ts    ← Unit tests (Jest)
test/
└── *.e2e-spec.ts   ← End-to-end tests (Supertest)
```

### Ejecutar tests

```bash
# Unit tests
npm run test

# Con cobertura
npm run test:cov

# End-to-end
npm run test:e2e
```

### Convención de Mocks

Los tests unitarios usan repositorios en memoria (`InMemoryRepository`) que implementan los mismos puertos (`IProjectRepository`, `ITaskRepository`) que los adaptadores de Prisma, garantizando el principio de Sustitución de Liskov.

---

## Estructura de Respuesta de Error

Todos los errores siguen el mismo formato:

```json
{
  "statusCode": 404,
  "error": "No encontrado",
  "mensaje": "El proyecto con ID 'abc-123' no fue encontrado.",
  "ruta": "/api/v1/projects/abc-123",
  "marca_temporal": "2024-01-15T10:30:00.000Z"
}
```

### Mapeo de Errores Prisma → HTTP

| Código Prisma | HTTP | Significado |
|---|---|---|
| `P2002` | 409 Conflict | Registro duplicado (UNIQUE) |
| `P2025` | 404 Not Found | Registro no encontrado |
| `P2003` | 400 Bad Request | Clave foránea inválida |
| `P2014` | 400 Bad Request | Relación requerida violada |
