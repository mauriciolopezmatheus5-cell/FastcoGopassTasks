/**
 * Tipos, enums y constantes de tareas para el frontend.
 * Los colores y etiquetas están extraídos del Figma GopassTasks.
 * Los valores del enum coinciden con el backend (NestJS + Prisma).
 */

// ── Enum de estados ─────────────────────────────────────────────────────────

/** Estados posibles de una tarea. Espejo exacto del enum Prisma del backend. */
export const TaskStatus = {
  PENDIENTE:  'PENDIENTE',
  COMPLETADA: 'COMPLETADA',
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

// ── Enum de prioridad ────────────────────────────────────────────────────────

/** Niveles de prioridad numérica. Rango -100 a 100. */
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

/** Etiquetas de texto en español para cada estado de tarea. */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.PENDIENTE]:  'Pendiente',
  [TaskStatus.COMPLETADA]: 'Completada',
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

/** Clases de Tailwind para el badge de cada estado de tarea. */
export const TASK_STATUS_STYLES: Record<TaskStatus, string> = {
  [TaskStatus.PENDIENTE]:
    'bg-status-pendiente text-status-text-pendiente',
  [TaskStatus.COMPLETADA]:
    'bg-status-completada text-status-text-completada',
};

/**
 * Clases de Tailwind para el punto de color (dot) de cada estado.
 * Usado como indicador visual pequeño junto al nombre del estado.
 */
export const TASK_STATUS_DOT_STYLES: Record<TaskStatus, string> = {
  [TaskStatus.PENDIENTE]:  'bg-status-dot-pendiente',
  [TaskStatus.COMPLETADA]: 'bg-status-dot-completada',
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
 * Transiciones de estado permitidas para una tarea (bidireccionales).
 * Usado en el selector de estado de TaskDetailPage.
 */
export const TASK_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.PENDIENTE]:  [TaskStatus.COMPLETADA],
  [TaskStatus.COMPLETADA]: [TaskStatus.PENDIENTE],
};

// ── Orden de columnas del tablero Kanban ──────────────────────────────────────

/** Orden de las columnas en el tablero Kanban (izquierda → derecha). */
export const KANBAN_COLUMN_ORDER: TaskStatus[] = [
  TaskStatus.PENDIENTE,
  TaskStatus.COMPLETADA,
];

// ── Función auxiliar para inferir nivel de prioridad ─────────────────────────

/**
 * Infiere el nivel de prioridad a partir de un valor numérico (-100 a 100).
 * @param priority - Valor numérico de prioridad (-100 a 100)
 * @returns El nivel de prioridad correspondiente
 */
export function getPriorityLevel(priority: number): PriorityLevel {
  if (priority >= 90) return PriorityLevel.URGENTE;
  if (priority >= 70) return PriorityLevel.ALTA;
  if (priority >= 30) return PriorityLevel.MEDIA;
  return PriorityLevel.BAJA;
}
