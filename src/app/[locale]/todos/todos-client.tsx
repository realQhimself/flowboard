"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { LabelBadge } from "@/components/shared/label-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { TaskDetailSheet } from "@/components/shared/task-detail-sheet";
import { PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format, isToday, isPast } from "date-fns";
import { createTask, toggleComplete } from "@/actions/task-actions";
import { getProject } from "@/actions/project-actions";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  ListTodo,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import type {
  Task,
  Column,
  Project,
  Label,
  TaskLabel,
} from "@/generated/prisma/client";

type TaskWithRelations = Task & {
  labels: (TaskLabel & { label: Label })[];
  subtasks: Task[];
  column: Column;
  project: Project;
};

type ProjectData = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  archived: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count: { tasks: number };
  completedCount: number;
  totalTasks: number;
};

interface TodosClientProps {
  initialTasks: TaskWithRelations[];
  projects: ProjectData[];
  labels: Label[];
}

type FilterStatus = "all" | "incomplete" | "completed";

export function TodosClient({
  initialTasks,
  projects,
  labels,
}: TodosClientProps) {
  const t = useTranslations("task");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Quick add state
  const [quickAddText, setQuickAddText] = useState("");
  const [quickAddProjectId, setQuickAddProjectId] = useState<string>(
    projects[0]?.id ?? ""
  );

  // Filter state
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [filterProjectId, setFilterProjectId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  // Task detail sheet
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(
    null
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [projectsWithColumns, setProjectsWithColumns] = useState<
    (Project & { columns: Column[] })[]
  >([]);

  // Collapsed groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return initialTasks.filter((task) => {
      if (filterPriority !== null && task.priority !== filterPriority)
        return false;
      if (filterProjectId && task.projectId !== filterProjectId) return false;
      if (filterStatus === "completed" && !task.completedAt) return false;
      if (filterStatus === "incomplete" && task.completedAt) return false;
      return true;
    });
  }, [initialTasks, filterPriority, filterProjectId, filterStatus]);

  // Group tasks by project
  const groupedTasks = useMemo(() => {
    const groups = new Map<string, { project: Project; tasks: TaskWithRelations[] }>();
    for (const task of filteredTasks) {
      if (!groups.has(task.projectId)) {
        groups.set(task.projectId, { project: task.project, tasks: [] });
      }
      groups.get(task.projectId)!.tasks.push(task);
    }
    return Array.from(groups.values());
  }, [filteredTasks]);

  const toggleGroup = (projectId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleQuickAdd = () => {
    if (!quickAddText.trim() || !quickAddProjectId) return;

    startTransition(async () => {
      try {
        // Find the default (Backlog) column for the selected project
        const project = await getProject(quickAddProjectId);
        if (!project) {
          toast.error("Project not found");
          return;
        }
        const defaultColumn =
          project.columns.find((c) => c.isDefault) ?? project.columns[0];
        if (!defaultColumn) {
          toast.error("No columns found in project");
          return;
        }

        await createTask({
          title: quickAddText.trim(),
          projectId: quickAddProjectId,
          columnId: defaultColumn.id,
        });
        setQuickAddText("");
        toast.success("Task created");
        router.refresh();
      } catch {
        toast.error("Failed to create task");
      }
    });
  };

  const handleToggleComplete = (taskId: string) => {
    startTransition(async () => {
      try {
        await toggleComplete(taskId);
        router.refresh();
      } catch {
        toast.error("Failed to toggle task");
      }
    });
  };

  const handleOpenDetail = async (task: TaskWithRelations) => {
    // Fetch projects with columns for the task detail sheet
    const projectsData: (Project & { columns: Column[] })[] = [];
    for (const proj of projects) {
      const fullProject = await getProject(proj.id);
      if (fullProject) {
        projectsData.push({
          ...fullProject,
          columns: fullProject.columns.map((c) => ({
            id: c.id,
            name: c.name,
            color: c.color,
            sortOrder: c.sortOrder,
            isDefault: c.isDefault,
            isDone: c.isDone,
            projectId: c.projectId,
          })),
        });
      }
    }
    setProjectsWithColumns(projectsData);
    setSelectedTask(task);
    setSheetOpen(true);
  };

  const getDueDateBadge = (dueDate: Date | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    if (isToday(date)) {
      return (
        <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px] px-1.5">
          <CalendarIcon className="size-3 mr-0.5" />
          {t("dueToday")}
        </Badge>
      );
    }
    if (isPast(date)) {
      return (
        <Badge variant="outline" className="text-red-600 border-red-300 text-[10px] px-1.5">
          <CalendarIcon className="size-3 mr-0.5" />
          {t("overdue")}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5">
        <CalendarIcon className="size-3 mr-0.5" />
        {format(date, "MMM d")}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{tNav("todos")}</h1>
      </div>

      {/* Quick Add Bar */}
      <div className="flex gap-2">
        <Select value={quickAddProjectId} onValueChange={setQuickAddProjectId}>
          <SelectTrigger className="w-[180px] shrink-0">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1 relative">
          <Input
            value={quickAddText}
            onChange={(e) => setQuickAddText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickAdd();
            }}
            placeholder={t("quickAdd")}
            disabled={!quickAddProjectId}
          />
        </div>
        <Button
          onClick={handleQuickAdd}
          disabled={isPending || !quickAddText.trim() || !quickAddProjectId}
          size="icon"
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Priority filters */}
        <div className="flex gap-1">
          {PRIORITIES.map((p) => (
            <Button
              key={p.value}
              variant={filterPriority === p.value ? "default" : "outline"}
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() =>
                setFilterPriority(
                  filterPriority === p.value ? null : p.value
                )
              }
              style={
                filterPriority === p.value
                  ? {
                      backgroundColor: p.color,
                      borderColor: p.color,
                      color: "white",
                    }
                  : undefined
              }
            >
              P{p.value}
            </Button>
          ))}
        </div>

        {/* Project filter */}
        <Select
          value={filterProjectId ?? "all"}
          onValueChange={(v) => setFilterProjectId(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[160px] h-7 text-xs">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        <div className="flex gap-1">
          {(["all", "incomplete", "completed"] as FilterStatus[]).map(
            (status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setFilterStatus(status)}
              >
                {status === "all"
                  ? "All"
                  : status === "incomplete"
                    ? t("incomplete")
                    : t("completed")}
              </Button>
            )
          )}
        </div>

        {/* Active filter count */}
        {(filterPriority || filterProjectId || filterStatus !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={() => {
              setFilterPriority(null);
              setFilterProjectId(null);
              setFilterStatus("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={
            filterPriority || filterProjectId || filterStatus !== "all"
              ? ListTodo
              : CheckCircle2
          }
          title={
            filterPriority || filterProjectId || filterStatus !== "all"
              ? tCommon("noResults")
              : t("noTasks")
          }
          description={
            initialTasks.length > 0
              ? "Try adjusting your filters"
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {groupedTasks.map(({ project, tasks }) => {
              const isCollapsed = collapsedGroups.has(project.id);
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-1"
                >
                  {/* Project Group Header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(project.id)}
                    className="flex items-center gap-2 w-full py-1 px-1 rounded-md hover:bg-accent transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="text-sm font-medium">{project.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({tasks.length})
                    </span>
                  </button>

                  {/* Tasks */}
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-0.5 ml-2">
                          {tasks.map((task) => (
                            <motion.div
                              key={task.id}
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/50 transition-colors group",
                                "border-l-2"
                              )}
                              style={{
                                borderLeftColor:
                                  PRIORITIES.find(
                                    (p) => p.value === task.priority
                                  )?.color ?? "#94a3b8",
                              }}
                            >
                              {/* Checkbox */}
                              <Checkbox
                                checked={!!task.completedAt}
                                onCheckedChange={() =>
                                  handleToggleComplete(task.id)
                                }
                                className="shrink-0"
                              />

                              {/* Task content */}
                              <button
                                type="button"
                                className="flex-1 min-w-0 flex items-center gap-2 text-left"
                                onClick={() => handleOpenDetail(task)}
                              >
                                <span
                                  className={cn(
                                    "text-sm truncate",
                                    task.completedAt &&
                                      "line-through text-muted-foreground"
                                  )}
                                >
                                  {task.title}
                                </span>
                              </button>

                              {/* Meta info */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <PriorityBadge priority={task.priority} />

                                {getDueDateBadge(task.dueDate)}

                                {task.labels.map((tl) => (
                                  <LabelBadge
                                    key={tl.labelId}
                                    name={tl.label.name}
                                    color={tl.label.color}
                                  />
                                ))}

                                {task.subtasks.length > 0 && (
                                  <span className="text-[10px] text-muted-foreground">
                                    {
                                      task.subtasks.filter(
                                        (s) => s.completedAt
                                      ).length
                                    }
                                    /{task.subtasks.length}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        projects={projectsWithColumns}
        labels={labels}
        onUpdated={() => router.refresh()}
      />
    </div>
  );
}
