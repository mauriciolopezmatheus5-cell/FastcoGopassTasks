/**
 * Enumeración de estados posibles de una tarea.
 * Espejo del enum TaskStatus definido en el schema de Prisma.
 */
export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  EN_PROGRESO = 'EN_PROGRESO',
  PRUEBAS_QA = 'PRUEBAS_QA',
  LISTO = 'LISTO',
  APROBADO = 'APROBADO',
}

/**
 * Matriz de transiciones válidas entre estados.
 * Define qué estados pueden seguir a cada estado dado.
 * Si un estado no está como destino, la transición es inválida.
 */
export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.BACKLOG]: [TaskStatus.EN_PROGRESO],
  [TaskStatus.EN_PROGRESO]: [TaskStatus.PRUEBAS_QA, TaskStatus.BACKLOG],
  [TaskStatus.PRUEBAS_QA]: [TaskStatus.EN_PROGRESO, TaskStatus.LISTO],
  [TaskStatus.LISTO]: [TaskStatus.APROBADO, TaskStatus.EN_PROGRESO],
  [TaskStatus.APROBADO]: [],
};
