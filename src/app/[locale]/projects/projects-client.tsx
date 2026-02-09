"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PROJECT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  createProject,
  deleteProject,
  updateProject,
} from "@/actions/project-actions";
import { Plus, FolderOpen, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

interface ProjectData {
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
}

interface ProjectsClientProps {
  initialProjects: ProjectData[];
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const t = useTranslations("project");
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(
    null
  );
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );

  // Create form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newColor, setNewColor] = useState<string>(PROJECT_COLORS[0]);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      try {
        await createProject({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          color: newColor,
        });
        setNewName("");
        setNewDescription("");
        setNewColor(PROJECT_COLORS[0]);
        setCreateDialogOpen(false);
        toast.success("Project created");
        router.refresh();
      } catch {
        toast.error("Failed to create project");
      }
    });
  };

  const handleEdit = () => {
    if (!editingProject || !editName.trim()) return;
    startTransition(async () => {
      try {
        await updateProject(editingProject.id, {
          name: editName.trim(),
          description: editDescription.trim() || undefined,
          color: editColor,
        });
        setEditDialogOpen(false);
        setEditingProject(null);
        toast.success("Project updated");
        router.refresh();
      } catch {
        toast.error("Failed to update project");
      }
    });
  };

  const handleDelete = () => {
    if (!deletingProjectId) return;
    startTransition(async () => {
      try {
        await deleteProject(deletingProjectId);
        setDeletingProjectId(null);
        toast.success("Project deleted");
        router.refresh();
      } catch {
        toast.error("Failed to delete project");
      }
    });
  };

  const openEdit = (project: ProjectData) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description ?? "");
    setEditColor(project.color);
    setEditDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {tNav("projects")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {initialProjects.length > 0
              ? `${initialProjects.length} ${t("tasks").includes("task") ? "projects" : t("tasks")}`
              : ""}
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              {t("create")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("create")}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t("name")}</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {t("description")}
                </label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder={t("descriptionPlaceholder")}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">{t("color")}</label>
                <div className="grid grid-cols-7 gap-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewColor(color)}
                      className={cn(
                        "size-8 rounded-full transition-all",
                        newColor === color
                          ? "ring-2 ring-offset-2 ring-offset-background"
                          : "hover:scale-110"
                      )}
                      style={
                        {
                          backgroundColor: color,
                          "--tw-ring-color": color,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isPending || !newName.trim()}
              >
                {t("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Grid */}
      {initialProjects.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title={t("noProjects")}
          description={t("createFirst")}
          actionLabel={t("create")}
          onAction={() => setCreateDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {initialProjects.map((project) => {
              const progress =
                project.totalTasks > 0
                  ? Math.round(
                      (project.completedCount / project.totalTasks) * 100
                    )
                  : 0;

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="group relative hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="size-3 rounded-full shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <h3 className="font-semibold text-base truncate">
                            {project.name}
                          </h3>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEdit(project);
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingProjectId(project.id);
                              setDeleteConfirmOpen(true);
                            }}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      {project.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {project.totalTasks} {t("tasks")}
                        </span>
                        <span className="text-muted-foreground font-medium">
                          {progress}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-1.5" />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("edit")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("name")}</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t("namePlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleEdit();
                }}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("description")}</label>
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder={t("descriptionPlaceholder")}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("color")}</label>
              <div className="grid grid-cols-7 gap-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditColor(color)}
                    className={cn(
                      "size-8 rounded-full transition-all",
                      editColor === color
                        ? "ring-2 ring-offset-2 ring-offset-background"
                        : "hover:scale-110"
                    )}
                    style={
                      {
                        backgroundColor: color,
                        "--tw-ring-color": color,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleEdit}
              disabled={isPending || !editName.trim()}
            >
              {tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t("delete")}
        description={tCommon("deleteConfirm")}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
