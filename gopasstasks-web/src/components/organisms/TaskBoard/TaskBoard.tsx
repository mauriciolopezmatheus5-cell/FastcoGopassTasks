import React, { useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useTasks, type TaskItem } from '@/hooks/queries/useTasks';
import { useUpdateTaskStatus } from '@/hooks/mutations/useUpdateTaskStatus';
import { useDeleteTask } from '@/hooks/mutations/useDeleteTask';
import { useUpdateTask } from '@/hooks/mutations/useUpdateTask';
import { TaskCard } from '@/components/organisms/TaskCard';
import { Spinner } from '@/components/atoms/Spinner';
import { KANBAN_COLUMN_ORDER, TaskStatus, TASK_STATUS_LABELS } from '@/types/task.types';

interface TaskBoardProps {
  projectId: string;
  onTaskClick?: (taskId: string) => void;
}

interface DroppableColumnProps {
  status: TaskStatus;
  tasks: TaskItem[];
  onTaskClick?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
}

interface DraggableTaskProps {
  task: TaskItem;
  onClick?: () => void;
  onDelete?: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  status,
  tasks,
  onTaskClick,
  onDeleteTask,
  onEditTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg p-4 min-h-[500px] transition-colors ${isOver ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-background-muted'}`}
    >
      <h3 className="font-semibold text-sm text-text-primary mb-4">
        {TASK_STATUS_LABELS[status]} ({tasks.length})
      </h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onClick={() => onTaskClick?.(task.id)}
            onDelete={onDeleteTask}
            onEdit={onEditTask}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-xs text-text-subtle text-center py-8">
            No hay tareas
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Tarea draggable
 */
const DraggableTask: React.FC<DraggableTaskProps> = ({ task, onClick, onDelete, onEdit }) => {
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
    id: task.id,
    data: { type: 'task', task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={!isDragging ? onClick : undefined}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskCard
        id={task.id}
        title={task.title}
        description={task.description ?? undefined}
        status={task.status}
        priority={task.priority}
        dueDate={task.dueDate ?? undefined}
        createdAt={task.createdAt}
        assignedMembers={task.assignedMembers}
        onClick={!isDragging ? onClick : undefined}
        onDelete={!isDragging ? onDelete : undefined}
        onEdit={!isDragging ? onEdit : undefined}
      />
    </div>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ projectId, onTaskClick }) => {
  const { data: tasks = [], isLoading, error } = useTasks({ projectId });
  const updateTaskStatus = useUpdateTaskStatus(projectId);
  const deleteTask = useDeleteTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = React.useState<TaskItem | null>(null);
  const [taskToEdit, setTaskToEdit] = React.useState<TaskItem | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeTask = React.useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? null,
    [tasks, activeTaskId],
  );

  const tasksByStatus = useMemo(
    () =>
      KANBAN_COLUMN_ORDER.reduce((acc, status) => {
        acc[status] = tasks.filter((task) => task.status === status);
        return acc;
      }, {} as Record<TaskStatus, TaskItem[]>),
    [tasks]
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setActiveTaskId(String(event.active.id));
    },
    []
  );

  const resolveTargetStatus = (event: DragEndEvent): TaskStatus | null => {
    const over = event.over;

    if (!over) {
      return null;
    }

    const overData = over.data.current as
      | { type: 'column'; status: TaskStatus }
      | { type: 'task'; task: TaskItem }
      | undefined;

    if (overData?.type === 'column') {
      return overData.status;
    }

    if (overData?.type === 'task') {
      return overData.task.status;
    }

    if (KANBAN_COLUMN_ORDER.includes(over.id as TaskStatus)) {
      return over.id as TaskStatus;
    }

    return null;
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const draggedTaskId = String(event.active.id);
      const draggedTask = tasks.find((task) => task.id === draggedTaskId);
      const targetStatus = resolveTargetStatus(event);

      setActiveTaskId(null);

      if (!draggedTask || !targetStatus || draggedTask.status === targetStatus) {
        return;
      }

      updateTaskStatus.mutate({ taskId: draggedTaskId, status: targetStatus });
    },
    [tasks, updateTaskStatus]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTaskId(null);
  }, []);

  const handleDeleteRequest = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId) ?? null;
      setTaskToDelete(task);
    },
    [tasks]
  );

  const confirmDelete = () => {
    if (!taskToDelete) return;
    deleteTask.mutate(taskToDelete.id, { onSettled: () => setTaskToDelete(null) });
  };

  const handleEditRequest = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId) ?? null;
      if (!task) return;
      setTaskToEdit(task);
      setEditTitle(task.title);
      setEditDescription(task.description ?? '');
    },
    [tasks]
  );

  const confirmEdit = () => {
    if (!taskToEdit || !editTitle.trim()) return;
    updateTask.mutate(
      { taskId: taskToEdit.id, title: editTitle.trim(), description: editDescription.trim() || undefined },
      { onSettled: () => setTaskToEdit(null) }
    );
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error al cargar tareas. Intenta de nuevo.
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
          {KANBAN_COLUMN_ORDER.map((status) => (
            <DroppableColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskClick={onTaskClick}
              onDeleteTask={handleDeleteRequest}
              onEditTask={handleEditRequest}
            />
          ))}
        </div>

        {/* Renderizar tarea en estado de drag sobre las columnas */}
        <DragOverlay>
          {activeTask && (
            <div className="w-72 opacity-90">
              <TaskCard
                id={activeTask.id}
                title={activeTask.title}
                description={activeTask.description ?? undefined}
                status={activeTask.status}
                priority={activeTask.priority}
                dueDate={activeTask.dueDate ?? undefined}
                assignedMembers={activeTask.assignedMembers}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Modal de confirmación de eliminación */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setTaskToDelete(null)}
          />
          {/* Dialog */}
          <div className="relative bg-background-card rounded-xl shadow-xl border border-border w-full max-w-sm mx-4 p-6 space-y-4">
            {/* Icono */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            {/* Texto */}
            <div className="text-center space-y-1">
              <h2 className="text-base font-semibold text-text-primary">
                ¿Eliminar tarea?
              </h2>
              <p className="text-sm text-text-secondary">
                ¿Estás seguro de eliminar{' '}
                <span className="font-medium text-text-primary">"{taskToDelete.title}"</span>
                {' '}con todas sus subtareas? Esta acción no se puede deshacer.
              </p>
            </div>
            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setTaskToDelete(null)}
                disabled={deleteTask.isPending}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-background-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteTask.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteTask.isPending ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición de tarea */}
      {taskToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setTaskToEdit(null)}
          />
          <div className="relative bg-background-card rounded-xl shadow-xl border border-border w-full max-w-md mx-4 p-6 space-y-4">
            <h2 className="text-base font-semibold text-text-primary">Editar tarea</h2>

            {/* Título */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                maxLength={120}
                className="w-full rounded-lg border border-border bg-background-app px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="Título de la tarea"
                autoFocus
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">Descripción</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-border bg-background-app px-3 py-2 text-sm text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none"
                placeholder="Descripción opcional…"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setTaskToEdit(null)}
                disabled={updateTask.isPending}
                className="flex-1 px-4 py-2 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-background-muted transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEdit}
                disabled={updateTask.isPending || !editTitle.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {updateTask.isPending ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
