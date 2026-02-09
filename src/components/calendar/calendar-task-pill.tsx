"use client";

import { cn } from "@/lib/utils";
import { PRIORITIES } from "@/lib/constants";
import type { TaskWithRelations } from "@/types";

interface CalendarTaskPillProps {
  task: TaskWithRelations;
  onClick?: (task: TaskWithRelations) => void;
  compact?: boolean;
}

export function CalendarTaskPill({ task, onClick, compact = false }: CalendarTaskPillProps) {
  const isCompleted = task.completedAt !== null;
  const priorityConfig = PRIORITIES.find((p) => p.value === task.priority) ?? PRIORITIES[3];
  const projectColor = task.project?.color ?? "#6366f1";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(task);
      }}
      className={cn(
        "group flex w-full items-center gap-1.5 rounded-md px-1.5 text-left transition-colors",
        compact ? "h-5 text-[10px]" : "h-6 text-xs",
        isCompleted
          ? "bg-muted/50 text-muted-foreground"
          : "bg-muted/80 hover:bg-muted text-foreground"
      )}
      style={{
        borderLeft: `2px solid ${priorityConfig.color}`,
      }}
    >
      <span
        className="size-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: projectColor }}
      />
      <span
        className={cn(
          "truncate leading-tight",
          isCompleted && "line-through"
        )}
      >
        {task.title}
      </span>
    </button>
  );
}
