/**
 * Tipos, enums y constantes de tareas para el frontend.
 * Los colores y etiquetas están extraídos del Figma GopassTasks.
 * Los valores del enum coinciden con el backend (NestJS + Prisma).
 *
 * Nota: El Figma usa nombres en inglés internamente (BACKLOG, IN_PROGRESS, QA, DONE, APPROVED),
 * pero el backend define los valores en español. Se usan los valores del backend.
 */

// ── Enum de estados ─────────────────────────────────────────────────────────

/** Estados posibles de una tarea. Espejo exacto del enum Prisma del backend. */
export const TaskStatus = {
  BACKLOG:     'BACKLOG',
  EN_PROGRESO: 'EN_PROGRESO',
  PRUEBAS_QA:  'PRUEBAS_QA',
  LISTO:       'LISTO',
  APROBADO:    'APROBADO',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

// ── Enum de prioridad ────────────────────────────────────────────────────────

/** Niveles de prioridad numérica. Rango -100 a 100. */
export const PriorityLevel = {
  /** Rango: -100 a 29 */
  BAJA:    'BAJA',
  /** Rango: 30 a 69 */
  MEDIA:   'MEDIA',
  /** Rango: 70 a 89 */
  ALTA:    'ALTA',
  /** Rango: 90 a 100 */
  URGENTE: 'URGENTE',
} as const;

export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];

// ── Etiquetas de visualización ───────────────────────────────────────────────

/**
 * Etiquetas de texto en español para cada estado de tarea.
 * Coinciden con las etiquetas visuales del tablero Kanban del Figma.
 * Si se agrega un nuevo TaskStatus sin actualizar este objeto → error de compilación.
 */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]:     'Backlog',
  [TaskStatus.EN_PROGRESO]: 'En Progreso',
  [TaskStatus.PRUEBAS_QA]:  'Pruebas QA',
  [TaskStatus.LISTO]:       'Listo',
  [TaskStatus.APROBADO]:    'Aprobado',
};

/**
 * Etiquetas de texto en español para cada nivel de prioridad.
 * Coinciden con los badges de prioridad del Figma.
 */
export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  [PriorityLevel.BAJA]:    'Baja',
  [PriorityLevel.MEDIA]:   'Media',
  [PriorityLevel.ALTA]:    'Alta',
  [PriorityLevel.URGENTE]: 'Urgente',
};

// ── Estilos de Tailwind por estado ───────────────────────────────────────────

/**
 * Clases de Tailwind para el badge de cada estado de tarea.
 * Los colores son exactamente los que aparecen en el Figma.
 * Configurados en tailwind.config.js bajo `colors.status.*`.
 */
export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]:
    'bg-status-backlog text-status-text-backlog',
  [TaskStatus.EN_PROGRESO]:
    'bg-status-en-progreso text-status-text-en-progreso',
  [TaskStatus.PRUEBAS_QA]:
    'bg-status-pruebas-qa text-status-text-pruebas-qa',
  [TaskStatus.LISTO]:
    'bg-status-listo text-status-text-listo',
  [TaskStatus.APROBADO]:
    'bg-status-aprobado text-status-text-aprobado',
};

/**
 * Clases de Tailwind para el punto de color (dot) de cada estado.
 * Usado como indicador visual pequeño junto al nombre del estado.
 */
export const TASK_STATUS_DOT_STYLES: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]:     'bg-status-dot-backlog',
  [TaskStatus.EN_PROGRESO]: 'bg-status-dot-en-progreso',
  [TaskStatus.PRUEBAS_QA]:  'bg-status-dot-pruebas-qa',
  [TaskStatus.LISTO]:       'bg-status-dot-listo',
  [TaskStatus.APROBADO]:    'bg-status-dot-aprobado',
};

// ── Estilos de Tailwind por prioridad ────────────────────────────────────────

/**
 * Clases de Tailwind para el badge de cada nivel de prioridad.
 * Los colores coinciden con los indicadores de prioridad del Figma.
 */
export const PRIORITY_STYLES: Record<PriorityLevel, string> = {
  [PriorityLevel.BAJA]:
    'bg-background-muted text-text-secondary border border-border',
  [PriorityLevel.MEDIA]:
    'bg-blue-50 text-blue-600 border border-blue-200',
  [PriorityLevel.ALTA]:
    'bg-red-50 text-red-600 border border-red-200',
  [PriorityLevel.URGENTE]:
    'bg-red-100 text-red-700 border border-red-300',
};

// ── Matriz de transiciones válidas ────────────────────────────────────────────

/**
 * Transiciones de estado permitidas para una tarea.
 * Coincide con la lógica de negocio del backend (T-TASK-04).
 * Usado en el selector de estado de TaskDetailPage.
 */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.BACKLOG]:     [TaskStatus.EN_PROGRESO],
  [TaskStatus.EN_PROGRESO]: [TaskStatus.PRUEBAS_QA, TaskStatus.BACKLOG],
  [TaskStatus.PRUEBAS_QA]:  [TaskStatus.EN_PROGRESO, TaskStatus.LISTO],
  [TaskStatus.LISTO]:       [TaskStatus.APROBADO, TaskStatus.EN_PROGRESO],
  [TaskStatus.APROBADO]:    [], // estado final — sin transiciones
};

// ── Orden de columnas del tablero Kanban ──────────────────────────────────────

/**
 * Orden de las columnas en el tablero Kanban.
 * Coincide con el orden visual del Figma de izquierda a derecha.
 */
export const KANBAN_COLUMN_ORDER: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.EN_PROGRESO,
  TaskStatus.PRUEBAS_QA,
  TaskStatus.LISTO,
  TaskStatus.APROBADO,
];

// ── Función auxiliar para inferir nivel de prioridad ─────────────────────────

/**
 * Infiere el nivel de prioridad a partir de un valor numérico (-100 a 100).
 * Usado para mostrar el badge de prioridad a partir del campo `priority` de la tarea.
 *
 * @param priority - Valor numérico de prioridad (-100 a 100)
 * @returns El nivel de prioridad correspondiente
 */
export function getPriorityLevel(priority: number): PriorityLevel {
  if (priority >= 90) return PriorityLevel.URGENTE;
  if (priority >= 70) return PriorityLevel.ALTA;
  if (priority >= 30) return PriorityLevel.MEDIA;
  return PriorityLevel.BAJA;
}
