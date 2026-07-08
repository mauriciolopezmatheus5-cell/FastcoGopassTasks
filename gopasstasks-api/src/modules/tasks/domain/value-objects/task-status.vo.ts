/**
 * Enumeración de estados posibles de una tarea.
 * Espejo del enum TaskStatus definido en el schema de Prisma.
 */
export enum TaskStatus {
  PENDIENTE  = 'PENDIENTE',
  COMPLETADA = 'COMPLETADA',
}

/**
 * Matriz de transiciones válidas entre estados.
 * Ambos estados pueden transicionar entre sí (bidireccional).
 */
export const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.PENDIENTE]:  [TaskStatus.COMPLETADA],
  [TaskStatus.COMPLETADA]: [TaskStatus.PENDIENTE],
};
