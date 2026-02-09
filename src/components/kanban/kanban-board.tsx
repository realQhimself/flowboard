"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { AddColumnButton } from "./add-column-button";
import { KanbanFilters } from "./kanban-filters";

import { createColumn, reorderColumns } from "@/actions/column-actions";
import { moveTask, reorderTasks, createTask } from "@/actions/task-actions";

import type {
  ProjectWithColumns,
  ColumnWithTasks,
  TaskWithRelations,
  Label,
} from "@/types";

interface KanbanBoardProps {
  project: ProjectWithColumns;
  labels: Label[];
}

export function KanbanBoard({ project, labels }: KanbanBoardProps) {
  const t = useTranslations("board");

  const [columns, setColumns] = useState<ColumnWithTasks[]>(project.columns);
  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<number[]>([]);
  const [labelFilter, setLabelFilter] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor)
  );

  const columnIds = useMemo(() => columns.map((c) => c.id), [columns]);

  // All unique labels from current tasks
  const allLabels = useMemo(() => {
    const labelMap = new Map<string, Label>();
    for (const col of columns) {
      for (const task of col.tasks) {
        for (const tl of task.labels) {
          labelMap.set(tl.label.id, tl.label);
        }
      }
    }
    // Also include any labels passed from server
    for (const label of labels) {
      labelMap.set(label.id, label);
    }
    return Array.from(labelMap.values());
  }, [columns, labels]);

  // Apply filters to columns for display
  const filteredColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((task) => {
        // Search filter
        if (
          searchQuery &&
          !task.title.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }
        // Priority filter
        if (priorityFilter.length > 0 && !priorityFilter.includes(task.priority)) {
          return false;
        }
        // Label filter
        if (labelFilter.length > 0) {
          const taskLabelIds = task.labels.map((tl) => tl.label.id);
          if (!labelFilter.some((id) => taskLabelIds.includes(id))) {
            return false;
          }
        }
        return true;
      }),
    }));
  }, [columns, searchQuery, priorityFilter, labelFilter]);

  const hasActiveFilters =
    searchQuery.length > 0 ||
    priorityFilter.length > 0 ||
    labelFilter.length > 0;

  function clearFilters() {
    setSearchQuery("");
    setPriorityFilter([]);
    setLabelFilter([]);
  }

  // Find which column a task belongs to (from unfiltered data)
  function findColumnByTaskId(taskId: string): ColumnWithTasks | undefined {
    return columns.find((col) => col.tasks.some((t) => t.id === taskId));
  }

  // Find a task by id (from unfiltered data)
  function findTaskById(taskId: string): TaskWithRelations | undefined {
    for (const col of columns) {
      const task = col.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeId = active.id as string;

    // Check if dragging a task
    const task = findTaskById(activeId);
    if (task) {
      setActiveTask(task);
      return;
    }

    // Check if dragging a column
    if (columns.some((c) => c.id === activeId)) {
      setActiveColumnId(activeId);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || !activeTask) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumnByTaskId(activeId);
    // over might be a column ID or a task ID
    let overColumn = columns.find((c) => c.id === overId);
    if (!overColumn) {
      overColumn = findColumnByTaskId(overId);
    }

    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) {
      return;
    }

    // Move task to a different column optimistically
    setColumns((prev) => {
      const sourceCol = prev.find((c) => c.id === activeColumn.id);
      const destCol = prev.find((c) => c.id === overColumn.id);
      if (!sourceCol || !destCol) return prev;

      const task = sourceCol.tasks.find((t) => t.id === activeId);
      if (!task) return prev;

      const sourceTasks = sourceCol.tasks.filter((t) => t.id !== activeId);

      // Find insert index
      const overTaskIndex = destCol.tasks.findIndex((t) => t.id === overId);
      const insertIndex = overTaskIndex >= 0 ? overTaskIndex : destCol.tasks.length;
      const destTasks = [...destCol.tasks];
      destTasks.splice(insertIndex, 0, { ...task, columnId: overColumn.id });

      return prev.map((col) => {
        if (col.id === sourceCol.id) {
          return { ...col, tasks: sourceTasks };
        }
        if (col.id === destCol.id) {
          return { ...col, tasks: destTasks };
        }
        return col;
      });
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumnId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Handle column reorder
    if (columns.some((c) => c.id === activeId) && columns.some((c) => c.id === overId)) {
      if (activeId !== overId) {
        const oldIndex = columns.findIndex((c) => c.id === activeId);
        const newIndex = columns.findIndex((c) => c.id === overId);
        const newColumns = arrayMove(columns, oldIndex, newIndex);
        setColumns(newColumns);

        try {
          await reorderColumns(
            project.id,
            newColumns.map((c) => c.id)
          );
        } catch {
          toast.error("Failed to reorder columns");
          setColumns(project.columns);
        }
      }
      return;
    }

    // Handle task drag
    const activeColumn = findColumnByTaskId(activeId);
    let overColumn = columns.find((c) => c.id === overId);
    if (!overColumn) {
      overColumn = findColumnByTaskId(overId);
    }

    if (!activeColumn || !overColumn) return;

    if (activeColumn.id === overColumn.id) {
      // Reorder within same column
      const col = columns.find((c) => c.id === activeColumn.id);
      if (!col) return;

      const oldIndex = col.tasks.findIndex((t) => t.id === activeId);
      const newIndex = col.tasks.findIndex((t) => t.id === overId);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const newTasks = arrayMove(col.tasks, oldIndex, newIndex);
      setColumns((prev) =>
        prev.map((c) =>
          c.id === col.id ? { ...c, tasks: newTasks } : c
        )
      );

      try {
        await reorderTasks(
          col.id,
          newTasks.map((t) => t.id)
        );
      } catch {
        toast.error("Failed to reorder tasks");
        setColumns(project.columns);
      }
    } else {
      // Move to different column (already handled in dragOver, just persist)
      const destCol = columns.find((c) => c.id === overColumn.id);
      if (!destCol) return;

      const taskIndex = destCol.tasks.findIndex((t) => t.id === activeId);
      const sortOrder = taskIndex >= 0 ? taskIndex : destCol.tasks.length;

      try {
        await moveTask(activeId, overColumn.id, sortOrder);
        // Reorder all tasks in the destination column to fix sort orders
        await reorderTasks(
          overColumn.id,
          destCol.tasks.map((t) => t.id)
        );
      } catch {
        toast.error("Failed to move task");
        setColumns(project.columns);
      }
    }
  }

  const handleCreateColumn = useCallback(
    async (name: string) => {
      try {
        const newColumn = await createColumn(project.id, name);
        setColumns((prev) => [...prev, { ...newColumn, tasks: newColumn.tasks ?? [] }]);
        toast.success(`Column "${name}" created`);
      } catch {
        toast.error("Failed to create column");
      }
    },
    [project.id]
  );

  const handleCreateTask = useCallback(
    async (columnId: string, title: string) => {
      try {
        const newTask = await createTask({
          title,
          projectId: project.id,
          columnId,
        });
        setColumns((prev) =>
          prev.map((col) =>
            col.id === columnId
              ? { ...col, tasks: [...col.tasks, newTask as TaskWithRelations] }
              : col
          )
        );
      } catch {
        toast.error("Failed to create task");
      }
    },
    [project.id]
  );

  const handleColumnUpdate = useCallback(() => {
    // Force a refresh from server
    // We rely on revalidatePath in the server action + Next.js revalidation
  }, []);

  const handleColumnDelete = useCallback(
    (columnId: string) => {
      setColumns((prev) => prev.filter((c) => c.id !== columnId));
    },
    []
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b shrink-0">
        <div
          className="h-4 w-4 rounded-full shrink-0"
          style={{ backgroundColor: project.color }}
        />
        <h1 className="text-xl font-bold tracking-tight">{project.name}</h1>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b shrink-0">
        <KanbanFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          labelFilter={labelFilter}
          onLabelFilterChange={setLabelFilter}
          labels={allLabels}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full items-start">
            <SortableContext
              items={columnIds}
              strategy={horizontalListSortingStrategy}
            >
              {filteredColumns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  column={column}
                  unfilteredTaskCount={
                    columns.find((c) => c.id === column.id)?.tasks.length ?? 0
                  }
                  onCreateTask={handleCreateTask}
                  onColumnUpdate={handleColumnUpdate}
                  onColumnDelete={handleColumnDelete}
                  projectId={project.id}
                />
              ))}
            </SortableContext>

            <AddColumnButton onCreateColumn={handleCreateColumn} />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeTask ? (
              <div className="rotate-2 opacity-90">
                <KanbanCard task={activeTask} isOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
