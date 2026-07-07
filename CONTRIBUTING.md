# Guía de Contribución — GopassTasks

¡Gracias por tu interés en contribuir a GopassTasks! Esta guía explica cómo participar en el proyecto de forma efectiva y profesional.

---

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo puedo contribuir?](#cómo-puedo-contribuir)
- [Configuración del entorno local](#configuración-del-entorno-local)
- [Flujo de trabajo con Git](#flujo-de-trabajo-con-git)
- [Estándares de código](#estándares-de-código)
- [Convenciones de commits](#convenciones-de-commits)
- [Pull Requests](#pull-requests)

---

## Código de Conducta

Este proyecto adhiere al principio de colaboración respetuosa. Se espera que todos los colaboradores actúen de manera profesional y considerada con los demás miembros del equipo.

---

## ¿Cómo puedo contribuir?

### 🐛 Reportar Bugs
Abre un issue usando la plantilla **Bug Report**. Incluye pasos para reproducir, comportamiento esperado vs actual, y el entorno (local/staging/producción).

### ✨ Sugerir Funcionalidades
Abre un issue usando la plantilla **Feature Request**. Describe el problema que resuelve y los criterios de aceptación.

### 🔧 Contribuir Código
1. Busca issues etiquetados con `good first issue` o `help wanted`.
2. Comenta en el issue que te interesa trabajar en él.
3. Sigue el [flujo de trabajo con Git](#flujo-de-trabajo-con-git).

---

## Configuración del Entorno Local

### Prerrequisitos
- Docker Desktop 4.x+ con Docker Compose v2
- Node.js 20.x
- Git 2.x

### Inicio rápido

```bash
# 1. Clonar el repositorio
git clone git@github.com:mauriciolopezmatheus5-cell/mlGopassTasks.git
cd mlGopassTasks

# 2. Configurar variables de entorno
cp .env.docker.example .env.docker
# Editar .env.docker con tus valores locales

# 3. Levantar el entorno completo
./scripts/start.sh --build --seed

# 4. Verificar que todo funciona
curl http://localhost:3000/api/health
# → { "status": "ok" }
```

### URLs del entorno local
| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/api/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

## Flujo de Trabajo con Git

Usamos **GitHub Flow** simplificado:

```
main
 └── feature/descripcion-corta
 └── fix/descripcion-del-bug
 └── docs/descripcion-del-cambio
```

### Pasos

1. **Crea una rama** desde `main`:
   ```bash
   git checkout main && git pull
   git checkout -b feature/nombre-de-la-feature
   ```

2. **Desarrolla** siguiendo los [estándares de código](#estándares-de-código).

3. **Verifica** antes de hacer push:
   ```bash
   # Backend
   cd gopasstasks-api && npm run lint && npm test

   # Frontend
   cd gopasstasks-web && npm run lint && npm run build
   ```

4. **Haz commits** siguiendo las [convenciones](#convenciones-de-commits).

5. **Abre un Pull Request** usando la plantilla provista.

---

## Estándares de Código

### TypeScript
- **Strict mode activado** — prohibido el tipo `any`
- Nombres de variables y funciones: `camelCase` en inglés
- Nombres de clases e interfaces: `PascalCase`
- Comentarios y mensajes de usuario: **español**

### Backend (NestJS)
- Respetar la **Arquitectura Hexagonal**: `domain` → `application` → `infrastructure`
- Cada nuevo endpoint debe tener decoradores Swagger (`@ApiOperation`, `@ApiResponse`)
- Los DTOs deben validarse con `class-validator` y mensajes en español
- No importar Prisma fuera de `infrastructure/adapters/output/`

### Frontend (React)
- Respetar **Atomic Design**: atoms → molecules → organisms → templates → pages
- No usar `useEffect` para llamadas a API — usar TanStack Query
- Solo estilos con clases de Tailwind (sin CSS inline ni CSS-in-JS)
- Los colores deben provenir de `tailwind.config.js` (derivado del Figma)

### Tests
- Cada módulo nuevo debe tener su archivo `.spec.ts` / `.test.tsx`
- Los tests unitarios no deben depender de bases de datos reales (usar mocks)

---

## Convenciones de Commits

Seguimos **Conventional Commits** (https://www.conventionalcommits.org):

```
<tipo>(<ámbito>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos permitidos

| Tipo | Descripción |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios solo en documentación |
| `style` | Formateo, punto y coma faltante, etc. (sin cambio de lógica) |
| `refactor` | Refactoring sin nuevas features ni bugs |
| `test` | Agregar o corregir tests |
| `chore` | Cambios en build, CI/CD, dependencias |
| `perf` | Mejoras de rendimiento |

### Ejemplos

```bash
feat(tasks): add work log recording endpoint
fix(auth): resolve JWT cookie not being sent on HTTPS
docs(api): update Swagger response schemas for projects
test(tasks): add unit tests for ChangeTaskStatusUseCase
chore(docker): update postgres image to 16-alpine
```

---

## Pull Requests

- Usa la plantilla de PR provista (se carga automáticamente)
- El PR debe tener un título descriptivo con el prefijo del tipo: `feat:`, `fix:`, etc.
- Los CI checks deben pasar antes de solicitar revisión
- Un PR debe hacer **una sola cosa** — si son cambios no relacionados, abre PRs separados
- Squash + merge al integrar a `main`

---

*GopassTasks — Prueba Técnica Senior Full Stack Developer*
