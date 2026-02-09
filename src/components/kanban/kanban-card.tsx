"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { Calendar, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITIES } from "@/lib/constants";

import type { TaskWithRelations } from "@/types";

interface KanbanCardProps {
  task: TaskWithRelations;
  isOverlay?: boolean;
  onClick?: () => void;
}

const priorityBorderColors: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#94a3b8",
};

export function KanbanCard({ task, isOverlay, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priorityColor = priorityBorderColors[task.priority] ?? "#94a3b8";
  const priorityInfo = PRIORITIES.find((p) => p.value === task.priority);
  const visibleLabels = task.labels.slice(0, 3);
  const extraLabelCount = task.labels.length - 3;

  const isOverdue =
    task.dueDate &&
    !task.completedAt &&
    new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing",
        "hover:shadow-md transition-shadow",
        isOverlay && "shadow-xl rotate-2 scale-105",
        isDragging && "z-50"
      )}
      onClick={onClick}
    >
      {/* Priority left border */}
      <div
        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full"
        style={{ backgroundColor: priorityColor }}
      />

      <div className="pl-2">
        {/* Drag handle + title row */}
        <div className="flex items-start gap-1">
          <button
            className="mt-0.5 shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100 cursor-grab active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <span
            className={cn(
              "text-sm font-medium leading-snug flex-1",
              task.completedAt && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </span>
        </div>

        {/* Meta row: priority badge + due date */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.priority <= 3 && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 font-medium"
              style={{
                backgroundColor: `${priorityColor}15`,
                color: priorityColor,
                borderColor: `${priorityColor}30`,
              }}
            >
              P{task.priority}
            </Badge>
          )}

          {task.dueDate && (
            <span
              className={cn(
                "flex items-center gap-1 text-[10px]",
                isOverdue
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
              )}
            >
              <Calendar className="h-2.5 w-2.5" />
              {format(new Date(task.dueDate), "MMM d")}
            </span>
          )}

          {task.subtasks && task.subtasks.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {task.subtasks.filter((s) => s.completedAt).length}/
              {task.subtasks.length}
            </span>
          )}
        </div>

        {/* Labels */}
        {visibleLabels.length > 0 && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {visibleLabels.map((tl) => (
              <span
                key={tl.label.id}
                className="inline-block h-1.5 w-6 rounded-full"
                style={{ backgroundColor: tl.label.color }}
                title={tl.label.name}
              />
            ))}
            {extraLabelCount > 0 && (
              <span className="text-[10px] text-muted-foreground">
                +{extraLabelCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
