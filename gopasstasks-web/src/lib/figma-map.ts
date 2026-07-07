/**
 * Mapa de pantallas del Figma GopassTasks → implementación en código.
 * Relaciona cada frame del Figma con su página, template y componentes.
 * Actualizar cuando se agreguen nuevas pantallas al Figma.
 *
 * URL Figma: https://coat-party-55196278.figma.site/
 */

export const FIGMA_SCREENS = {
  DASHBOARD: {
    /** Nombre del frame en el Figma */
    figmaFrame: 'Dashboard / Tablero Kanban',
    /** Ruta de React Router */
    route: '/',
    /** Componente de página */
    page: 'src/pages/DashboardPage',
    /** Template de layout */
    template: 'DashboardLayout',
    /** Organismos que componen la pantalla */
    organisms: ['Navbar', 'Sidebar', 'TaskBoard'],
    /** Notas de implementación */
    notes: 'Pantalla principal. Muestra el tablero Kanban del proyecto activo seleccionado en el sidebar. 5 columnas: Backlog, En Progreso, Pruebas QA, Listo, Aprobado.',
    /** Estados de UI identificados en el Figma */
    states: {
      loading: 'Skeleton cards en cada columna del tablero',
      empty: 'Mensaje "No hay tareas en esta columna" con ilustración',
      error: 'ErrorFallback con botón de reintentar',
    },
  },

  PROJECTS: {
    figmaFrame: 'Proyectos',
    route: '/proyectos',
    page: 'src/pages/DashboardPage',
    template: 'DashboardLayout',
    organisms: ['Navbar', 'Sidebar', 'ProjectList'],
    notes: 'Lista de todos los proyectos del usuario. Incluye botón "Nuevo Proyecto" que abre modal con formulario. Cada tarjeta muestra nombre, descripción, conteo de miembros y tareas.',
    states: {
      loading: 'Skeleton de tarjetas de proyecto',
      empty: 'Mensaje "No tienes proyectos" con CTA para crear el primero',
      error: 'ErrorFallback',
    },
  },

  PROJECT_DETAIL: {
    figmaFrame: 'Detalle de Proyecto / Kanban',
    route: '/proyectos/:id',
    page: 'src/pages/ProjectDetailPage',
    template: 'DashboardLayout',
    organisms: ['Navbar', 'Sidebar', 'TaskBoard'],
    notes: 'Tablero Kanban del proyecto seleccionado. Botón "Nueva Tarea" abre TaskForm en modal. Click en tarjeta navega a /tareas/:id.',
    states: {
      loading: 'Spinner mientras carga el proyecto',
      empty: 'Mensaje "No hay tareas" con CTA para crear la primera',
      error: 'ErrorFallback si el proyecto no existe (404)',
    },
  },

  MY_TASKS: {
    figmaFrame: 'Mis Tareas',
    route: '/mis-tareas',
    page: 'src/pages/MyTasksPage',
    template: 'DashboardLayout',
    organisms: ['Navbar', 'Sidebar', 'TaskList'],
    notes: 'Lista de tareas asignadas al usuario autenticado. Filtros por estado y prioridad. Agrupadas por proyecto.',
    states: {
      loading: 'Skeleton de lista de tareas',
      empty: 'Mensaje "No tienes tareas asignadas"',
      error: 'ErrorFallback',
    },
  },

  TASK_DETAIL: {
    figmaFrame: 'Detalle de Tarea',
    route: '/tareas/:id',
    page: 'src/pages/TaskDetailPage',
    template: 'DashboardLayout',
    organisms: ['TaskDetail', 'WorkLogList', 'WorkLogForm'],
    notes: 'Vista completa de la tarea: título, descripción, estado (con transiciones válidas), prioridad, fechas, miembros asignados y registro de trabajo. Permite editar en línea.',
    states: {
      loading: 'Skeleton del detalle',
      error: 'ErrorFallback si la tarea no existe (404)',
    },
  },

  CALENDAR: {
    figmaFrame: 'Calendario',
    route: '/calendario',
    page: 'src/pages/CalendarPage',
    template: 'DashboardLayout',
    organisms: ['Navbar', 'Sidebar', 'CalendarView'],
    notes: 'Vista de calendario con tareas organizadas por fecha de vencimiento. Permite navegar entre meses.',
    states: {
      loading: 'Skeleton del calendario',
      empty: 'Calendario vacío sin eventos',
    },
  },

  SETTINGS: {
    figmaFrame: 'Ajustes',
    route: '/ajustes',
    page: 'src/pages/SettingsPage',
    template: 'DashboardLayout',
    organisms: ['Navbar', 'Sidebar', 'SettingsForm'],
    notes: 'Configuración del usuario: tema de color (Indigo, Violet, Blue, Emerald, Rose, Amber), preferencias de notificación, gestión de cuenta.',
    states: {
      default: 'Formulario de ajustes con valores actuales',
    },
  },

  LOGIN: {
    figmaFrame: 'Login / Autenticación',
    route: '/login',
    page: 'src/pages/LoginPage',
    template: 'AuthLayout',
    organisms: ['LoginForm'],
    notes: 'Pantalla centrada sin sidebar ni navbar. Logo completo (ícono + "GopassTasks" + "WORKSPACE") en la parte superior. Formulario con email y contraseña.',
    states: {
      default: 'Formulario de login vacío',
      loading: 'Botón con spinner durante la solicitud',
      error: 'Mensaje de error bajo el formulario',
    },
  },
} as const;

/**
 * Variantes de componentes identificadas en el Figma.
 * Cada componente debe implementar todos sus estados visuales.
 */
export const COMPONENT_STATES = {
  Button: ['default', 'hover', 'active', 'disabled', 'loading'],
  Input: ['default', 'focus', 'error', 'disabled'],
  TaskCard: ['default', 'hover', 'dragging'],
  Badge: ['backlog', 'en-progreso', 'pruebas-qa', 'listo', 'aprobado'],
  PriorityBadge: ['baja', 'media', 'alta', 'urgente'],
  Avatar: ['with-image', 'with-initials'],
  ProjectCard: ['default', 'hover'],
  NavItem: ['default', 'active', 'hover'],
} as const;
