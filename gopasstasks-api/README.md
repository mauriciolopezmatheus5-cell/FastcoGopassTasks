# GopassTasks API 🔧

Backend REST API del sistema GopassTasks. Construido con **NestJS**, **Prisma ORM** y **PostgreSQL**, siguiendo **Arquitectura Hexagonal (Ports & Adapters)** con principios SOLID y Clean Architecture.

> Para levantar el entorno completo con Docker, consulta el [README raíz](../README.md).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | NestJS 10+ |
| Lenguaje | TypeScript (strict mode) |
| Base de datos | PostgreSQL 16 |
| ORM | Prisma ORM |
| Autenticación | JWT en Cookies HttpOnly |
| Caché | Redis 7 |
| Documentación | Swagger / OpenAPI 3.0 |
| Testing | Jest + Supertest |

---

## Prerrequisitos (desarrollo local sin Docker)

- Node.js 20+
- PostgreSQL 16 corriendo localmente
- Redis 7 corriendo localmente (opcional para desarrollo)

---

## Instalación

```bash
npm install
```

---

## Variables de Entorno

Copia el archivo de ejemplo y configura los valores:

```bash
cp .env.example .env
```

| Variable | Descripción | Requerida |
|---|---|---|
| `NODE_ENV` | Entorno de ejecución (`development` / `production`) | ✅ |
| `PORT` | Puerto del servidor (default: `3000`) | — |
| `DATABASE_URL` | URL de conexión a PostgreSQL | ✅ |
| `JWT_SECRET` | Secreto JWT (mínimo 32 caracteres) | ✅ |
| `FRONTEND_URL` | URL del frontend para CORS | ✅ |
| `REDIS_HOST` | Host de Redis (default: `localhost`) | — |
| `REDIS_PORT` | Puerto de Redis (default: `6379`) | — |

---

## Base de Datos

```bash
# Aplicar migraciones
npx prisma migrate dev

# Poblar con datos iniciales (roles + usuario admin)
npx prisma db seed

# Abrir Prisma Studio (GUI para inspeccionar datos)
npx prisma studio
```

**Usuario administrador creado por el seed:**

| Campo | Valor |
|---|---|
| Email | `admin@gopasstasks.com` |
| Contraseña | `Admin1234!` |
| Rol | `ADMIN` |

---

## Ejecutar el Servidor

```bash
# Modo desarrollo (hot reload)
npm run start:dev

# Modo producción
npm run start:prod

# Compilar sin ejecutar
npm run build
```

La API estará disponible en: `http://localhost:3000/api/v1`

Swagger UI: `http://localhost:3000/api/docs`

---

## Tests

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Cobertura de código
npm run test:cov

# Tests e2e
npm run test:e2e
```

---

## Arquitectura Hexagonal

```
src/
├── modules/
│   ├── auth/
│   │   ├── application/        # Casos de uso: Login, Register
│   │   ├── domain/             # Entidad User, Puerto IUserRepository
│   │   └── infrastructure/
│   │       ├── adapters/input/  # AuthController, JwtStrategy
│   │       └── adapters/output/ # PrismaUserRepository
│   ├── projects/
│   │   ├── application/        # Casos de uso: CRUD + miembros
│   │   ├── domain/             # Entidad Project, Puerto IProjectRepository
│   │   └── infrastructure/
│   │       ├── adapters/input/  # ProjectController
│   │       └── adapters/output/ # PrismaProjectRepository
│   ├── tasks/
│   │   ├── application/        # Casos de uso: CRUD + estados + worklogs
│   │   ├── domain/             # Entidad Task, Enum TaskStatus
│   │   └── infrastructure/
│   │       ├── adapters/input/  # TaskController, ProjectTasksController
│   │       └── adapters/output/ # PrismaTaskRepository
│   ├── users/                  # Perfil del usuario autenticado
│   └── admin/                  # Gestión de usuarios (solo ADMIN)
├── shared/
│   ├── domain/exceptions/      # DomainException, RecursoNoEncontrado, etc.
│   ├── guards/                 # JwtAuthGuard, RolesGuard, @Roles()
│   └── infrastructure/
│       ├── database/           # PrismaService
│       ├── filters/            # GlobalExceptionFilter
│       └── health/             # HealthController
└── main.ts
```

**Principio de dependencia:**

```
Input Adapters → Input Ports → Domain Core → Output Ports → Output Adapters
```

El dominio nunca importa Prisma, NestJS ni ningún framework externo.

---

## Endpoints Principales

```
POST   /api/v1/auth/register              Registrar usuario
POST   /api/v1/auth/login                 Iniciar sesión
POST   /api/v1/auth/logout                Cerrar sesión

GET    /api/v1/projects                   Listar proyectos del usuario
POST   /api/v1/projects                   Crear proyecto
GET    /api/v1/projects/:id               Obtener proyecto
PATCH  /api/v1/projects/:id               Actualizar proyecto
DELETE /api/v1/projects/:id               Eliminar proyecto
POST   /api/v1/projects/:id/members       Agregar miembro
DELETE /api/v1/projects/:id/members/:uid  Remover miembro

GET    /api/v1/projects/:id/tasks         Listar tareas del proyecto
POST   /api/v1/tasks                      Crear tarea
GET    /api/v1/tasks/:id                  Obtener tarea
PATCH  /api/v1/tasks/:id                  Actualizar tarea
DELETE /api/v1/tasks/:id                  Eliminar tarea
PATCH  /api/v1/tasks/:id/status           Cambiar estado
POST   /api/v1/tasks/:id/assign           Asignar usuario
DELETE /api/v1/tasks/:id/assign/:uid      Desasignar usuario
POST   /api/v1/tasks/:id/work-logs        Registrar tiempo
GET    /api/v1/tasks/:id/work-logs        Listar registros de tiempo

GET    /api/v1/users/me                   Perfil propio
PATCH  /api/v1/users/me                   Actualizar perfil

GET    /api/v1/admin/users                Listar usuarios (ADMIN)
PATCH  /api/v1/admin/users/:id/role       Cambiar rol de usuario (ADMIN)

GET    /api/health                        Health check (sin auth)
```

Documentación completa disponible en Swagger: `http://localhost:3000/api/docs`

---

## Transiciones de Estado de Tareas

```
BACKLOG     → EN_PROGRESO
EN_PROGRESO → PRUEBAS_QA, BACKLOG
PRUEBAS_QA  → EN_PROGRESO, LISTO
LISTO       → APROBADO, EN_PROGRESO
APROBADO    → (ninguna transición permitida)
```

---

## Seguridad

- **JWT en Cookie HttpOnly:** El token nunca se expone en el body de la respuesta.
- **Helmet:** Protección de cabeceras HTTP (XSS, Clickjacking, MIME sniffing).
- **CORS restrictivo:** Solo el dominio configurado en `FRONTEND_URL` puede acceder.
- **ValidationPipe global:** `whitelist: true` descarta campos no declarados en DTOs.
- **Fail Fast:** Si falta una variable de entorno crítica, la app no inicia.

---

## Linting

```bash
npm run lint
npm run lint:fix
npm run format
```
