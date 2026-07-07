import { TaskEntity } from '../entities/task.entity';
import { TaskStatus } from '../value-objects/task-status.vo';

/** Token de inyección de dependencias para el repositorio de tareas. */
export const TASK_REPOSITORY = 'TASK_REPOSITORY';

/** Información de un registro de trabajo de una tarea. */
export interface WorkLogEntry {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  timeSpentMinutes: number;
  description: string | null;
  recordedAt: Date;
}

/**
 * Puerto de salida (Output Port) del repositorio de tareas.
 * Define el contrato que cualquier implementación de persistencia debe cumplir.
 * El dominio depende de esta interfaz, nunca de Prisma directamente.
 */
export interface ITaskRepository {
  /**
   * Busca una tarea por su identificador único.
   * @param id - UUID de la tarea
   */
  findById(id: string): Promise<TaskEntity | null>;

  /**
   * Lista tareas de un proyecto con filtros opcionales.
   * @param projectId - ID del proyecto
   * @param filters - Filtros opcionales por estado y prioridad
   */
  findByProject(
    projectId: string,
    filters?: { status?: TaskStatus; priority?: number },
  ): Promise<TaskEntity[]>;

  /**
   * Persiste una nueva tarea en la base de datos.
   * @param task - Entidad TaskEntity a crear
   */
  save(task: TaskEntity): Promise<TaskEntity>;

  /**
   * Actualiza una tarea existente.
   * @param task - Entidad TaskEntity con los datos actualizados
   */
  update(task: TaskEntity): Promise<TaskEntity>;

  /**
   * Elimina una tarea por su ID.
   * @param id - UUID de la tarea a eliminar
   * @throws RecursoNoEncontradoException si la tarea no existe
   */
  delete(id: string): Promise<void>;

  /**
   * Obtiene los miembros asignados a una tarea.
   * @param taskId - ID de la tarea
   */
  findMembers(taskId: string): Promise<{ userId: string; name: string; email: string }[]>;

  /**
   * Agrega un usuario como miembro de la tarea.
   * @param taskId - ID de la tarea
   * @param userId - ID del usuario a asignar
   */
  addMember(taskId: string, userId: string): Promise<void>;

  /**
   * Remueve un usuario de los miembros de la tarea.
   * @param taskId - ID de la tarea
   * @param userId - ID del usuario a remover
   */
  removeMember(taskId: string, userId: string): Promise<void>;

  /**
   * Verifica si un usuario es miembro de la tarea.
   * @param taskId - ID de la tarea
   * @param userId - ID del usuario
   */
  isMember(taskId: string, userId: string): Promise<boolean>;

  /**
   * Registra tiempo trabajado en una tarea.
   * @param taskId - ID de la tarea
   * @param userId - ID del usuario que registra el tiempo
   * @param timeSpentMinutes - Minutos trabajados (mínimo 1)
   * @param description - Descripción opcional del trabajo realizado
   */
  addWorkLog(
    taskId: string,
    userId: string,
    timeSpentMinutes: number,
    description?: string,
  ): Promise<WorkLogEntry>;

  /**
   * Lista todos los registros de trabajo de una tarea.
   * @param taskId - ID de la tarea
   */
  getWorkLogs(taskId: string): Promise<WorkLogEntry[]>;

  /**
   * Guarda el historial de descripción cuando la tarea llega a estado APROBADO.
   * @param taskId - ID de la tarea
   * @param description - Descripción a historizar
   */
  saveDescriptionHistory(taskId: string, description: string): Promise<void>;
}
