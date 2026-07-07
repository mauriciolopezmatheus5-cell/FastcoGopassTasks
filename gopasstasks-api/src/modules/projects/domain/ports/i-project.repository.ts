import { Project } from '../entities/project.entity';

/**
 * Información pública de un miembro del proyecto.
 */
export interface ProjectMemberInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
  joinedAt: Date;
}

/**
 * Puerto de salida (Output Port) del repositorio de proyectos.
 * Define el contrato que cualquier implementación de persistencia debe cumplir.
 * El dominio depende de esta interfaz, nunca de Prisma directamente.
 */
export interface IProjectRepository {
  /**
   * Lista todos los proyectos en los que el usuario es miembro.
   * @param userId - ID del usuario autenticado
   */
  findAll(userId: string): Promise<Project[]>;

  /**
   * Busca un proyecto por su identificador único.
   * @param id - UUID del proyecto
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Persiste un nuevo proyecto en la base de datos.
   * @param project - Entidad Project a crear
   */
  save(project: Project): Promise<Project>;

  /**
   * Actualiza un proyecto existente.
   * @param project - Entidad Project con los datos actualizados
   */
  update(project: Project): Promise<Project>;

  /**
   * Elimina un proyecto por su ID.
   * @param id - UUID del proyecto a eliminar
   * @throws RecursoNoEncontradoException si el proyecto no existe
   */
  delete(id: string): Promise<void>;

  /**
   * Verifica si un usuario es miembro del proyecto.
   * @param projectId - ID del proyecto
   * @param userId - ID del usuario
   */
  isUserMember(projectId: string, userId: string): Promise<boolean>;

  /**
   * Obtiene el rol de un usuario en el proyecto.
   * @param projectId - ID del proyecto
   * @param userId - ID del usuario
   * @returns El rol ('ADMIN' | 'MEMBER') o null si no es miembro
   */
  getUserRole(projectId: string, userId: string): Promise<string | null>;

  /**
   * Agrega un usuario como miembro del proyecto con el rol indicado.
   * @param projectId - ID del proyecto
   * @param userId - ID del usuario a agregar
   * @param role - Rol a asignar ('ADMIN' | 'MEMBER')
   * @throws RecursoDuplicadoException si el usuario ya es miembro
   */
  addMember(projectId: string, userId: string, role: string): Promise<void>;

  /**
   * Elimina la membresía de un usuario en el proyecto.
   * @param projectId - ID del proyecto
   * @param userId - ID del usuario a remover
   */
  removeMember(projectId: string, userId: string): Promise<void>;

  /**
   * Lista todos los miembros de un proyecto con sus datos de usuario.
   * @param projectId - ID del proyecto
   */
  getMembers(projectId: string): Promise<ProjectMemberInfo[]>;

  /**
   * Retorna el número de miembros del proyecto.
   * @param projectId - ID del proyecto
   */
  getMemberCount(projectId: string): Promise<number>;

  /**
   * Retorna el número de tareas del proyecto.
   * @param projectId - ID del proyecto
   */
  getTaskCount(projectId: string): Promise<number>;

  /**
   * Retorna el número de miembros con rol ADMIN en el proyecto.
   * @param projectId - ID del proyecto
   */
  getAdminCount(projectId: string): Promise<number>;
}

/** Token de inyección de dependencias para el repositorio de proyectos. */
export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';
