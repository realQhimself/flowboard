import type { Project, Column, Task, Label, TaskLabel, CalendarEvent, AppSettings } from "@/generated/prisma/client";

export type { Project, Column, Task, Label, TaskLabel, CalendarEvent, AppSettings };

export type TaskWithRelations = Task & {
  labels: (TaskLabel & { label: Label })[];
  subtasks: Task[];
  column: Column;
  project: Project;
};

export type ColumnWithTasks = Column & {
  tasks: TaskWithRelations[];
};

export type ProjectWithColumns = Project & {
  columns: ColumnWithTasks[];
};

export type ProjectWithProgress = Project & {
  _count: { tasks: number };
  completedCount: number;
};

export type DashboardStats = {
  totalTasks: number;
  completedToday: number;
  overdue: number;
  dueThisWeek: number;
};

export type CompletionDataPoint = {
  date: string;
  count: number;
};

export type PriorityDataPoint = {
  priority: number;
  label: string;
  count: number;
  color: string;
};
