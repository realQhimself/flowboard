"use client";

import { useState, useRef, useEffect } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanCard } from "./kanban-card";
import { KanbanColumnHeader } from "./kanban-column-header";

import type { ColumnWithTasks } from "@/types";

interface KanbanColumnProps {
  column: ColumnWithTasks;
  unfilteredTaskCount: number;
  onCreateTask: (columnId: string, title: string) => Promise<void>;
  onColumnUpdate: () => void;
  onColumnDelete: (columnId: string) => void;
  projectId: string;
}

export function KanbanColumn({
  column,
  unfilteredTaskCount,
  onCreateTask,
  onColumnUpdate,
  onColumnDelete,
  projectId,
}: KanbanColumnProps) {
  const t = useTranslations("task");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map((task) => task.id);

  useEffect(() => {
    if (isAddingTask && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingTask]);

  async function handleCreateTask() {
    const title = newTaskTitle.trim();
    if (!title) return;

    setIsCreating(true);
    try {
      await onCreateTask(column.id, title);
      setNewTaskTitle("");
      // Keep the input open for quick successive adds
    } finally {
      setIsCreating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleCreateTask();
    }
    if (e.key === "Escape") {
      setIsAddingTask(false);
      setNewTaskTitle("");
    }
  }

  return (
    <div
      className="group/col flex flex-col shrink-0 w-[280px] max-h-[calc(100vh-220px)]"
    >
      {/* Column Header */}
      <KanbanColumnHeader
        column={column}
        taskCount={unfilteredTaskCount}
        onColumnUpdate={onColumnUpdate}
        onColumnDelete={onColumnDelete}
      />

      {/* Task List */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto rounded-lg p-2 transition-colors ${
          isOver ? "bg-accent/50 ring-2 ring-primary/20" : "bg-muted/50"
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 min-h-[40px]">
            <AnimatePresence initial={false}>
              {column.tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <KanbanCard task={task} />
                </motion.div>
              ))}
            </AnimatePresence>

            {column.tasks.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                {t("noTasks")}
              </div>
            )}
          </div>
        </SortableContext>

        {/* Quick Add Task */}
        <div className="mt-2">
          <AnimatePresence>
            {isAddingTask ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Input
                  ref={inputRef}
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => {
                    if (!newTaskTitle.trim()) {
                      setIsAddingTask(false);
                    }
                  }}
                  placeholder={t("quickAdd")}
                  disabled={isCreating}
                  className="text-sm bg-card"
                />
              </motion.div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                {t("create")}
              </Button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
