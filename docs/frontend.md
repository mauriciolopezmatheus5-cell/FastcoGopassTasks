# GopassTasks Web — Documentación Frontend

> **Versión:** 0.0.0  
> **Framework:** React 19 + Vite 8  
> **Lenguaje:** TypeScript 6 (strict mode)  
> **Carpeta de trabajo:** `gopasstasks-web/`

---

## Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Páginas y Rutas](#páginas-y-rutas)
4. [Componentes (Atomic Design)](#componentes-atomic-design)
5. [Gestión de Datos](#gestión-de-datos)
6. [Estado Global](#estado-global)
7. [Sistema de Diseño](#sistema-de-diseño)
8. [Paquetes Utilizados](#paquetes-utilizados)
9. [Variables de Entorno](#variables-de-entorno)
10. [Cómo Correr el Proyecto](#cómo-correr-el-proyecto)
11. [Testing](#testing)

---

## Arquitectura

El frontend sigue la metodología **Atomic Design** combinada con los principios **SOLID** y una separación clara entre estado del servidor (TanStack Query) y estado de UI (Zustand).

```
Atoms → Molecules → Organisms → Templates → Pages
                                              ↕
                               Hooks (Queries / Mutations)
                                              ↕
                                    Axios → API Backend
```

### Principios clave

| Principio | Implementación |
|-----------|---------------|
| **Sin `useEffect` para APIs** | Todo data fetching usa TanStack Query |
| **Sin `any`** | TypeScript strict mode activado |
| **Validación defensiva** | Todas las respuestas de API pasan por Zod antes de usarse en la UI |
| **Estado de servidor ≠ Estado de UI** | TanStack Query gestiona datos remotos; Zustand gestiona UI local |
| **Optimistic Updates** | `useUpdateTaskStatus` aplica el cambio antes de la respuesta del servidor con rollback automático |

---

## Estructura de Carpetas

```
gopasstasks-web/src/
├── main.tsx                   ← Punto de entrada (React + QueryClientProvider)
├── App.tsx                    ← Componente raíz
├── components/
│   ├── atoms/                 ← Elementos básicos e indivisibles
│   │   ├── Avatar/            ← Iniciales o imagen de usuario
│   │   ├── Badge/             ← Etiquetas de colores
│   │   ├── Button/            ← Botón con variantes y estados
│   │   ├── Input/             ← Campo de texto con estados
│   │   ├── Label/             ← Etiqueta de formulario
│   │   └── Spinner/           ← Indicador de carga
│   ├── molecules/             ← Grupos simples de átomos
│   │   ├── FormField/         ← Label + Input + mensaje de error
│   │   ├── PriorityIndicator/ ← Indicador visual de prioridad (-100 a 100)
│   │   ├── RoleBadge/         ← Badge con rol del usuario
│   │   ├── RoleSelector/      ← Selector de rol
│   │   ├── SearchBar/         ← Input de búsqueda con debounce
│   │   └── TaskStatusBadge/   ← Badge de estado de tarea
│   ├── organisms/             ← Componentes complejos con lógica propia
│   │   ├── Navbar/            ← Barra de navegación superior
│   │   ├── Sidebar/           ← Panel de navegación lateral
│   │   ├── ProjectForm/       ← Formulario de creación/edición de proyecto
│   │   ├── ProjectList/       ← Lista de tarjetas de proyectos
│   │   ├── TaskBoard/         ← Tablero Kanban con 5 columnas
│   │   ├── TaskCard/          ← Tarjeta de tarea para el tablero
│   │   ├── TaskForm/          ← Formulario de creación/edición de tarea
│   │   └── UserTable/         ← Tabla de administración de usuarios
│   └── templates/             ← Layouts de página
│       ├── AuthLayout/        ← Layout centrado sin sidebar (login)
│       └── DashboardLayout/   ← Layout principal con Sidebar + Navbar
├── pages/                     ← Vistas finales (orquestan templates + organisms)
│   ├── LoginPage/             ← Autenticación
│   ├── DashboardPage/         ← Lista de proyectos
│   ├── ProjectDetailPage/     ← Tablero Kanban del proyecto
│   ├── TaskDetailPage/        ← Vista completa de una tarea
│   └── AdminPage/             ← Panel de administración de usuarios
├── hooks/
│   ├── queries/               ← TanStack Query (lectura)
│   │   ├── useProjects.ts
│   │   ├── useProject.ts
│   │   ├── useTasks.ts
│   │   ├── useTask.ts
│   │   ├── useWorkLogs.ts
│   │   ├── useAdminUsers.ts
│   │   └── useRoles.ts
│   └── mutations/             ← TanStack Mutation (escritura)
│       ├── useCreateProject.ts
│       ├── useCreateTask.ts
│       ├── useUpdateTaskStatus.ts    ← Optimistic update + rollback
│       ├── useAssignTaskMember.ts
│       ├── useLogWork.ts
│       ├── useChangeUserRole.ts
│       └── useDeactivateUser.ts
├── store/
│   ├── auth.store.ts          ← Zustand: usuario autenticado
│   └── ui.store.ts            ← Zustand: sidebar abierto/cerrado
├── lib/
│   ├── axios.ts               ← Cliente Axios con interceptores globales
│   ├── query-client.ts        ← Configuración de TanStack Query
│   └── zod-schemas.ts         ← Schemas de validación Zod
├── router/
│   ├── AppRouter.tsx          ← Definición de rutas
│   └── ProtectedRoute.tsx     ← Guard de autenticación
├── config/
│   └── env.ts                 ← Variables de entorno tipadas (Fail Fast)
└── types/
    ├── task.types.ts          ← TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_STYLES
    ├── project.types.ts       ← Project, ProjectMember DTOs
    └── auth.types.ts          ← User, AuthState DTOs
```

---

## Páginas y Rutas

| Ruta | Componente | Acceso | Descripción |
|------|-----------|--------|-------------|
| `/` | — | Público | Redirige a `/projects` |
| `/login` | `LoginPage` | Público | Formulario de autenticación |
| `/projects` | `DashboardPage` | 🔒 Protegida | Lista de proyectos del usuario |
| `/projects/:id` | `ProjectDetailPage` | 🔒 Protegida | Tablero Kanban del proyecto |
| `/tasks/:id` | `TaskDetailPage` | 🔒 Protegida | Detalle completo de la tarea |
| `*` | — | Público | Redirige a `/login` |

### `ProtectedRoute`

Verifica que `useAuthStore().usuario !== null`. Si no hay sesión activa, redirige a `/login` con `<Navigate replace />`.

---

## Componentes (Atomic Design)

### Atoms

Elementos mínimos y reutilizables sin lógica de negocio.

| Componente | Props principales | Descripción |
|-----------|-------------------|-------------|
| `Button` | `variant`, `size`, `isLoading`, `leftIcon`, `rightIcon` | Variantes: `primary`, `secondary`, `outline`, `danger` |
| `Input` | `type`, `error`, `disabled`, `leftIcon` | Con soporte para `ref` forwarding |
| `Badge` | `variant`, `children` | Etiqueta de color para estados y roles |
| `Spinner` | `size` | Indicador de carga circular |
| `Avatar` | `name`, `src`, `size` | Muestra iniciales o imagen de perfil |
| `Label` | `htmlFor`, `required` | Etiqueta accesible para formularios |

### Molecules

Composiciones simples de átomos.

| Componente | Descripción |
|-----------|-------------|
| `FormField` | `Label` + `Input` + mensaje de error. Compatible con React Hook Form |
| `TaskStatusBadge` | Muestra el estado de la tarea con colores del sistema de diseño |
| `PriorityIndicator` | Visualiza la prioridad (-100 a 100) con colores por rango |
| `SearchBar` | Input de búsqueda con debounce de 300ms |
| `RoleBadge` | Badge visual para roles de usuario |
| `RoleSelector` | Dropdown para selección de rol |

### Organisms

Componentes con lógica propia; pueden usar hooks de datos.

| Componente | Hook de datos | Descripción |
|-----------|---------------|-------------|
| `TaskBoard` | `useTasks(projectId)` | Tablero Kanban con 5 columnas, drag-and-drop con `@dnd-kit` |
| `TaskCard` | — (recibe datos por props) | Tarjeta de tarea con estado, prioridad, avatares y fecha de vencimiento |
| `TaskForm` | `useCreateTask` / `useUpdateTask` | Formulario validado con React Hook Form + Zod |
| `ProjectList` | `useProjects()` | Cuadrícula de tarjetas de proyectos |
| `ProjectForm` | `useCreateProject` | Formulario de creación de proyecto |
| `Navbar` | `useAuthStore` | Logo, nombre del usuario, botón de logout |
| `Sidebar` | `useUIStore` | Navegación principal con rutas activas |
| `UserTable` | `useAdminUsers()` | Tabla de gestión de usuarios (solo Admin) |

### Templates

Definen la estructura visual de la página sin datos reales.

| Template | Descripción |
|---------|-------------|
| `DashboardLayout` | `Sidebar` fijo + `Navbar` superior + área de contenido (`<Outlet />`) |
| `AuthLayout` | Centrado verticalmente, sin sidebar. Para login/registro |

---

## Gestión de Datos

### Cliente Axios (`src/lib/axios.ts`)

Instancia central con `baseURL = VITE_API_URL` y `withCredentials: true` para enviar cookies HttpOnly automáticamente.

**Interceptores de respuesta:**

| Código HTTP | Comportamiento |
|------------|---------------|
| `401` | Redirige a `/login` y limpia el store de Zustand |
| `403` | `toast.error('No tienes permisos...')` |
| `409` | `toast.error(mensajeServidor)` |
| `5xx` | `toast.error('Ocurrió un error inesperado...')` |
| `400 / 422` | Pasa sin interceptar (lo maneja React Hook Form) |

### TanStack Query (`src/lib/query-client.ts`)

Configuración global:
- `staleTime: 5 minutos` — evita refetches innecesarios
- `refetchOnWindowFocus: false`
- `retry`: no reintenta en errores 4xx

**Patrón de Query Hook:**

```typescript
export const useProjects = () =>
  useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.get('/v1/projects');
      // Validación defensiva con Zod
      return ProjectListSchema.parse(data);
    },
  });
```

**Optimistic Update — `useUpdateTaskStatus`:**

```
1. onMutate  → actualiza el cache inmediatamente (UI responde al instante)
2. onError   → revierte al snapshot anterior si el servidor falla
3. onSettled → invalida la query para sincronizar con el servidor
```

### Validación con Zod (`src/lib/zod-schemas.ts`)

Todos los responses de la API se validan con Zod antes de usarlos en la UI, previniendo errores silenciosos por cambios de contrato.

---

## Estado Global

### `auth.store.ts` (Zustand)

```typescript
interface AuthState {
  usuario: UsuarioDto | null;
  setUsuario: (usuario: UsuarioDto) => void;
  limpiarSesion: () => void;
}
```

El store **no persiste en localStorage**; el JWT vive en la cookie HttpOnly del servidor.

### `ui.store.ts` (Zustand)

```typescript
interface UIState {
  sidebarAbierto: boolean;
  toggleSidebar: () => void;
  cerrarSidebar: () => void;
}
```

Controla la apertura del sidebar en vistas móviles.

---

## Sistema de Diseño

Derivado del **Figma de GopassTasks**. Toda configuración visual está en `tailwind.config.js` como fuente única de verdad.

### Paleta de Colores

| Token | Valor Hex | Uso |
|-------|-----------|-----|
| `primary` | `#6366F1` | Acciones principales, botones |
| `primary-dark` | `#4F46E5` | Hover de acciones |
| `primary-light` | `#EEF2FF` | Fondos sutiles, badges |
| `background-app` | `#F1F5F9` | Fondo general de la app |
| `background-sidebar` | `#FFFFFF` | Fondo del sidebar |
| `background-card` | `#FFFFFF` | Fondo de tarjetas |
| `text-primary` | `#0F172A` | Texto principal |
| `text-secondary` | `#475569` | Texto secundario |
| `text-muted` | `#64748B` | Metadatos, placeholders |
| `border` | `#E2E8F0` | Bordes estándar |
| `border-focus` | `#6366F1` | Borde en foco de inputs |

### Colores de Estado de Tarea

| Estado | Fondo | Texto | Dot |
|--------|-------|-------|-----|
| `BACKLOG` | `#F1F5F9` slate-100 | `#475569` slate-600 | `#94A3B8` |
| `EN_PROGRESO` | `#DBEAFE` blue-100 | `#1D4ED8` blue-700 | `#3B82F6` |
| `PRUEBAS_QA` | `#FEF3C7` amber-100 | `#B45309` amber-700 | `#F59E0B` |
| `LISTO` | `#D1FAE5` emerald-100 | `#047857` emerald-700 | `#10B981` |
| `APROBADO` | `#EDE9FE` violet-100 | `#6D28D9` violet-700 | `#8B5CF6` |

### Tipografía y Espaciado

- **Fuente:** `Inter` (sans-serif)
- **Fuente mono:** `JetBrains Mono`
- **Border radius:** `sm=4px`, `md=8px`, `lg=12px`, `xl=16px`
- **Sombras:** `card` (sutil) y `card-hover` (elevación al hacer hover)
- **Ancho sidebar:** `256px`

### Drag and Drop

El tablero Kanban usa **`@dnd-kit`** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) para arrastrar tarjetas entre columnas de estado.

---

## Paquetes Utilizados

### Producción

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `react` | ^19.2.5 | Librería de UI principal |
| `react-dom` | ^19.2.5 | Renderizado en el DOM |
| `react-router-dom` | ^7.14.2 | Enrutamiento SPA |
| `@tanstack/react-query` | ^5.100.5 | Data fetching, caché, sincronización con servidor |
| `axios` | ^1.15.2 | Cliente HTTP con interceptores |
| `zustand` | ^5.0.12 | Estado global ligero |
| `zod` | ^4.3.6 | Validación de schemas TypeScript-first |
| `react-hook-form` | ^7.74.0 | Formularios con validación performante |
| `@hookform/resolvers` | ^5.2.2 | Adaptador React Hook Form ↔ Zod |
| `sonner` | ^2.0.7 | Notificaciones toast accesibles |
| `react-error-boundary` | ^6.1.1 | Error Boundaries declarativos |
| `@dnd-kit/core` | ^6.3.1 | Drag-and-drop (tablero Kanban) |
| `@dnd-kit/sortable` | ^10.0.0 | Listas sortables con DnD |
| `@dnd-kit/utilities` | ^3.2.2 | Utilidades para DnD |

### Desarrollo

| Paquete | Propósito |
|---------|-----------|
| `vite` | Bundler y servidor de desarrollo con HMR |
| `@vitejs/plugin-react` | Soporte React en Vite |
| `typescript` | Compilador TypeScript |
| `tailwindcss` | Framework CSS utilitario |
| `postcss` + `autoprefixer` | Procesamiento CSS |
| `vitest` | Test runner compatible con Vite |
| `@testing-library/react` | Utilidades de testing para componentes React |
| `@testing-library/user-event` | Simulación de eventos de usuario en tests |
| `jsdom` | Entorno DOM para tests |
| `eslint` + `typescript-eslint` | Linting |
| `eslint-plugin-react-hooks` | Reglas para hooks de React |

---

## Variables de Entorno

Archivo: `gopasstasks-web/.env.development`

```env
VITE_API_URL=http://localhost:3000/api
```

La variable se accede mediante `src/config/env.ts` que aplica validación Fail Fast al arrancar:

```typescript
// Si VITE_API_URL no está definida → error descriptivo en consola al iniciar
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL,  // requerida
  ES_PRODUCCION: import.meta.env.MODE === 'production',
} as const;
```

**Producción:** En AWS ECS, `VITE_API_URL` se inyecta como `ARG` en tiempo de build del Dockerfile multi-stage.

---

## Cómo Correr el Proyecto

### Con Docker (recomendado)

```bash
# Desde la raíz del monorepo
cp .env.docker.example .env.docker

# Primera vez
./scripts/start.sh --build --seed

# La aplicación queda disponible en http://localhost:5173
```

### Modo Desarrollo Local (sin Docker)

**Prerrequisitos:** Node.js 20+, API backend corriendo en `http://localhost:3000`.

```bash
cd gopasstasks-web

# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
# El archivo .env.development ya tiene la URL por defecto:
# VITE_API_URL=http://localhost:3000/api

# 3. Iniciar servidor de desarrollo con HMR
npm run dev
```

La aplicación quedará disponible en `http://localhost:5173`.

### Scripts disponibles

```bash
npm run dev       # Servidor de desarrollo Vite con HMR
npm run build     # Compilar para producción (tsc + vite build)
npm run preview   # Previsualizar el build de producción
npm run lint      # ESLint
```

### Probar Build de Producción Localmente

```bash
# Construir imagen Docker de producción
docker build -f Dockerfile --build-arg VITE_API_URL=http://localhost:3000/api -t gopasstasks-web:prod .

# Correr imagen de producción con Nginx
docker run -p 80:80 gopasstasks-web:prod
# Accesible en http://localhost
```

---

## Testing

### Framework: Vitest + Testing Library

```bash
# Ejecutar tests
npx vitest

# Con cobertura
npx vitest --coverage
```

### Estructura de Tests

```
src/
└── components/
    └── [Componente]/
        └── [Componente].test.tsx   ← Co-ubicados con el componente
src/
└── hooks/
    └── [hooks].test.ts
```

### Convenciones de Testing

- **Componentes:** `render()` + `screen` queries de Testing Library
- **Hooks de query:** mock de `api` (Axios) y `queryClient`
- **Stores Zustand:** se puede usar directamente en tests sin mocks
- **Formularios:** `userEvent` para simular escritura y clicks

---

## Flujo de Autenticación

```
1. Usuario llena LoginPage (email + password)
2. useLogin() → POST /api/v1/auth/login
3. Backend establece cookie 'access_token' (HttpOnly)
4. onSuccess → setUsuario(user) en Zustand → redirect /projects
5. Axios envía la cookie automáticamente en cada request (withCredentials: true)
6. Si el servidor responde 401 → interceptor limpia Zustand + redirige a /login
```

---

## Consideraciones de Producción

### Dockerfile Multi-stage

El frontend de producción usa **Nginx 1.27** para servir los archivos estáticos.

```nginx
# nginx.conf — SPA React Router
location / {
  try_files $uri $uri/ /index.html;  # Permite F5 en rutas de React Router
}
location ~* \.(js|css|png|svg)$ {
  expires 1y;
  add_header Cache-Control "public, immutable";  # Cache agresivo para assets con hash
}
location /health {
  return 200 'ok';  # Health check para ECS + ALB
}
```

### Variables de entorno en producción

Las variables `VITE_*` se incorporan al bundle en tiempo de build (no en runtime). Por ello, `VITE_API_URL` se pasa como `ARG` al `docker build` en el pipeline de CI/CD:

```bash
docker build -f Dockerfile \
  --build-arg VITE_API_URL=https://api.gopasstasks.com/api \
  -t gopasstasks-web:latest .
```
