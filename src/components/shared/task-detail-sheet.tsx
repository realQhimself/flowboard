"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { LabelBadge } from "@/components/shared/label-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  updateTask,
  deleteTask,
  toggleComplete,
  createSubtask,
} from "@/actions/task-actions";
import { toggleTaskLabel } from "@/actions/label-actions";
import {
  Trash2,
  Calendar as CalendarIcon,
  Plus,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { Task, Column, Project, Label, TaskLabel } from "@/generated/prisma/client";

type TaskWithRelations = Task & {
  labels: (TaskLabel & { label: Label })[];
  subtasks: Task[];
  column: Column;
  project: Project;
};

interface TaskDetailSheetProps {
  task: TaskWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: (Project & { columns: Column[] })[];
  labels: Label[];
  onUpdated?: () => void;
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  projects,
  labels,
  onUpdated,
}: TaskDetailSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState(task?.priority ?? 4);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task?.dueDate ? new Date(task.dueDate) : undefined
  );
  const [projectId, setProjectId] = useState(task?.projectId ?? "");
  const [columnId, setColumnId] = useState(task?.columnId ?? "");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
      setProjectId(task.projectId);
      setColumnId(task.columnId);
    }
  }, [task]);

  if (!task) return null;

  const selectedProject = projects.find((p) => p.id === projectId);
  const projectColumns = selectedProject?.columns ?? [];
  const taskLabelIds = task.labels.map((tl) => tl.labelId);

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateTask(task.id, {
          title,
          description: description || null,
          priority,
          dueDate: dueDate ?? null,
          projectId,
          columnId,
        });
        toast.success("Task updated");
        onUpdated?.();
      } catch {
        toast.error("Failed to update task");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteTask(task.id);
        toast.success("Task deleted");
        onOpenChange(false);
        onUpdated?.();
      } catch {
        toast.error("Failed to delete task");
      }
    });
  };

  const handleToggleComplete = () => {
    startTransition(async () => {
      try {
        await toggleComplete(task.id);
        toast.success(
          task.completedAt ? "Task reopened" : "Task completed"
        );
        onUpdated?.();
      } catch {
        toast.error("Failed to toggle task");
      }
    });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    startTransition(async () => {
      try {
        await createSubtask(task.id, newSubtaskTitle.trim());
        setNewSubtaskTitle("");
        toast.success("Subtask added");
        onUpdated?.();
      } catch {
        toast.error("Failed to add subtask");
      }
    });
  };

  const handleToggleLabel = (labelId: string) => {
    startTransition(async () => {
      try {
        await toggleTaskLabel(task.id, labelId);
        onUpdated?.();
      } catch {
        toast.error("Failed to toggle label");
      }
    });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    startTransition(async () => {
      try {
        await toggleComplete(subtaskId);
        onUpdated?.();
      } catch {
        toast.error("Failed to toggle subtask");
      }
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-[420px] sm:max-w-[420px] overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle className="sr-only">Task Details</SheetTitle>
            <SheetDescription className="sr-only">
              Edit task details
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-5 px-4 pb-6">
            {/* Completion toggle */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={!!task.completedAt}
                onCheckedChange={handleToggleComplete}
              />
              <span
                className={cn(
                  "text-sm",
                  task.completedAt && "text-muted-foreground line-through"
                )}
              >
                {task.completedAt ? "Completed" : "Mark complete"}
              </span>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task name..."
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors",
                      priority === p.value
                        ? "border-transparent"
                        : "border-border hover:bg-accent"
                    )}
                    style={
                      priority === p.value
                        ? {
                            backgroundColor: `${p.color}20`,
                            color: p.color,
                          }
                        : undefined
                    }
                  >
                    P{p.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Due Date</label>
              <div className="flex items-center gap-2">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={(date) => {
                        setDueDate(date ?? undefined);
                        setDatePickerOpen(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                {dueDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDueDate(undefined)}
                    className="shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Project */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Project</label>
              <Select
                value={projectId}
                onValueChange={(value) => {
                  setProjectId(value);
                  const proj = projects.find((p) => p.id === value);
                  const defaultCol = proj?.columns.find((c) => c.isDefault);
                  if (defaultCol) setColumnId(defaultCol.id);
                }}
              >
                <SelectTrigger className="w-full">
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
            </div>

            {/* Column / Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {projectColumns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: col.color }}
                        />
                        {col.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Labels */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Labels</label>
              <div className="flex flex-wrap gap-1.5">
                {labels.map((label) => {
                  const isActive = taskLabelIds.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => handleToggleLabel(label.id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-opacity",
                        isActive ? "opacity-100" : "opacity-40 hover:opacity-70"
                      )}
                      style={{
                        backgroundColor: `${label.color}20`,
                        color: label.color,
                      }}
                    >
                      {isActive && <Check className="size-3" />}
                      {label.name}
                    </button>
                  );
                })}
                {labels.length === 0 && (
                  <span className="text-xs text-muted-foreground">
                    No labels available
                  </span>
                )}
              </div>
            </div>

            {/* Subtasks */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Subtasks
                {task.subtasks.length > 0 && (
                  <span className="ml-1 text-muted-foreground font-normal">
                    ({task.subtasks.filter((s) => s.completedAt).length}/
                    {task.subtasks.length})
                  </span>
                )}
              </label>
              <div className="space-y-1">
                {task.subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
                  >
                    <Checkbox
                      checked={!!subtask.completedAt}
                      onCheckedChange={() => handleToggleSubtask(subtask.id)}
                    />
                    <span
                      className={cn(
                        "text-sm flex-1",
                        subtask.completedAt &&
                          "line-through text-muted-foreground"
                      )}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add subtask..."
                  className="text-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleAddSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  className="shrink-0"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              <Button
                onClick={handleSave}
                disabled={isPending || !title.trim()}
                className="flex-1"
              >
                Save Changes
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isPending}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  );
}
