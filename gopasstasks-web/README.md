# GopassTasks Web 🌐

Frontend del sistema GopassTasks. Construido con **React 18 + Vite**, **TailwindCSS** y **TanStack Query**, siguiendo la metodología **Atomic Design** con TypeScript en strict mode.

> Para levantar el entorno completo con Docker, consulta el [README raíz](../README.md).

---

## Stack

| Categoría | Tecnología |
|---|---|
| Core | React 18+ |
| Bundler | Vite 6+ |
| Lenguaje | TypeScript (strict mode) |
| Estilos | TailwindCSS |
| Estado servidor | TanStack Query (React Query) |
| Estado global | Zustand |
| Validación | Zod |
| Formularios | React Hook Form + @hookform/resolvers |
| HTTP | Axios (con interceptores globales) |
| Notificaciones | Sonner |
| Router | React Router v6 |
| Testing | Vitest + Testing Library |

---

## Prerrequisitos (desarrollo local sin Docker)

- Node.js 20+
- API backend corriendo en `http://localhost:3000`

---

## Instalación

```bash
npm install
```

---

## Variables de Entorno

```bash
cp .env.example .env.development
```

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (ej: `http://localhost:3000/api`) |

---

## Ejecutar en Desarrollo

```bash
npm run dev
```

La app estará disponible en: `http://localhost:5173`

---

## Build de Producción

```bash
npm run build
npm run preview   # previsualizar el build localmente
```

---

## Tests

```bash
# Tests unitarios
npm run test

# Tests en modo watch
npm run test:watch

# Cobertura de código
npm run test:coverage
```

---

## Arquitectura — Atomic Design

```
src/
├── components/
│   ├── atoms/              # Elementos básicos: Button, Input, Badge, Spinner, Avatar, Label
│   ├── molecules/          # Grupos simples: FormField, SearchBar, TaskStatusBadge, PriorityIndicator
│   ├── organisms/          # Componentes complejos: Navbar, Sidebar, TaskCard, TaskBoard, TaskForm, ProjectList
│   └── templates/          # Layouts: DashboardLayout, AuthLayout
├── pages/                  # Vistas finales: LoginPage, DashboardPage, ProjectDetailPage, TaskDetailPage
├── hooks/
│   ├── queries/            # TanStack Query hooks: useProjects, useTasks, useTask, useWorkLogs
│   └── mutations/          # Mutation hooks: useCreateTask, useUpdateTaskStatus, useLogWork
├── store/                  # Zustand: auth.store (usuario), ui.store (sidebar)
├── lib/                    # axios.ts, query-client.ts, design-tokens.ts, figma-map.ts
├── types/                  # DTOs del frontend: task.types.ts, admin.types.ts
├── router/                 # AppRouter.tsx, ProtectedRoute.tsx
└── config/
    └── env.ts              # Validación de variables de entorno (fail fast)
```

**Jerarquía de responsabilidades:**

| Capa | Responsabilidad |
|---|---|
| Atoms | Solo renderizado visual. Sin lógica ni llamadas a API. |
| Molecules | Composición de átomos. Sin llamadas a API. |
| Organisms | Pueden usar hooks de datos y lógica propia. |
| Templates | Solo estructura/grid. Sin datos reales. |
| Pages | Orquestan templates + organisms + hooks. |

---

## Rutas

| Ruta | Página | Protegida |
|---|---|---|
| `/login` | `LoginPage` | ❌ |
| `/projects` | `DashboardPage` | ✅ |
| `/projects/:id` | `ProjectDetailPage` | ✅ |
| `/tasks/:id` | `TaskDetailPage` | ✅ |
| `/admin` | `AdminPage` | ✅ ADMIN |

Las rutas protegidas redirigen a `/login` si no hay sesión activa.

---

## Convenciones Clave

- **Sin `useEffect` para API** — toda llamada usa TanStack Query.
- **Sin `any`** — TypeScript strict mode en todo momento.
- **Sin estilos inline** — Tailwind es el único motor de estilos.
- **Imports absolutos** con alias `@/` → `src/`.
- **Validación Zod** sobre cada respuesta del servidor antes de usarla en UI.
- **Optimistic updates** en cambios de estado de tareas con rollback automático.

---

## Seguridad

- Las cookies HttpOnly del JWT son enviadas automáticamente por Axios (`withCredentials: true`).
- Interceptor de Axios maneja 401 → redirección a login, 403 → toast de permisos.
- `ProtectedRoute` verifica el store de Zustand antes de renderizar rutas privadas.

---

## Linting y Tipado

```bash
npm run lint
npm run lint:fix
npm run type-check
```
