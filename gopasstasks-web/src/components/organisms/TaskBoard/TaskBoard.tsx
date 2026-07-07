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
}

interface DraggableTaskProps {
  task: TaskItem;
  onClick?: () => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({
  status,
  tasks,
  onTaskClick,
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
const DraggableTask: React.FC<DraggableTaskProps> = ({ task, onClick }) => {
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
        assignedMembers={task.assignedMembers}
        onClick={!isDragging ? onClick : undefined}
      />
    </div>
  );
};

export const TaskBoard: React.FC<TaskBoardProps> = ({ projectId, onTaskClick }) => {
  const { data: tasks = [], isLoading, error } = useTasks({ projectId });
  const updateTaskStatus = useUpdateTaskStatus(projectId);
  const [activeTaskId, setActiveTaskId] = React.useState<string | null>(null);

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 pb-4">
        {KANBAN_COLUMN_ORDER.map((status) => (
          <DroppableColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick}
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
  );
};
