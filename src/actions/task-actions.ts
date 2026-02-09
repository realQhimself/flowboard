"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(4).default(4),
  dueDate: z.coerce.date().optional().nullable(),
  projectId: z.string().min(1, "Project is required"),
  columnId: z.string().min(1, "Column is required"),
  parentId: z.string().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  priority: z.number().int().min(1).max(4).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  projectId: z.string().min(1).optional(),
  columnId: z.string().min(1).optional(),
  archived: z.boolean().optional(),
});

export async function getTasks(filters?: {
  projectId?: string;
  priority?: number;
  completed?: boolean | null;
  search?: string;
}) {
  const where: Record<string, unknown> = {
    parentId: null,
  };

  if (filters?.projectId) {
    where.projectId = filters.projectId;
  }

  if (filters?.priority) {
    where.priority = filters.priority;
  }

  if (filters?.completed === true) {
    where.completedAt = { not: null };
  } else if (filters?.completed === false) {
    where.completedAt = null;
  }

  if (filters?.search) {
    where.title = { contains: filters.search };
  }

  const tasks = await prisma.task.findMany({
    where,
    orderBy: [{ project: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      labels: {
        include: { label: true },
      },
      subtasks: {
        orderBy: { sortOrder: "asc" },
      },
      column: true,
      project: true,
    },
  });

  return tasks;
}

export async function createTask(data: {
  title: string;
  description?: string;
  priority?: number;
  dueDate?: Date | string | null;
  projectId: string;
  columnId: string;
  parentId?: string | null;
}) {
  const validated = createTaskSchema.parse(data);

  const maxSortOrder = await prisma.task.aggregate({
    where: { columnId: validated.columnId, parentId: validated.parentId ?? null },
    _max: { sortOrder: true },
  });
  const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      title: validated.title,
      description: validated.description,
      priority: validated.priority,
      dueDate: validated.dueDate,
      projectId: validated.projectId,
      columnId: validated.columnId,
      parentId: validated.parentId,
      sortOrder: nextSortOrder,
    },
    include: {
      labels: {
        include: { label: true },
      },
      subtasks: true,
      column: true,
      project: true,
    },
  });

  revalidatePath("/");
  return task;
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    priority?: number;
    dueDate?: Date | string | null;
    projectId?: string;
    columnId?: string;
    archived?: boolean;
  }
) {
  const validated = updateTaskSchema.parse(data);

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...validated,
      dueDate: data.dueDate === null ? null : validated.dueDate,
    },
    include: {
      labels: {
        include: { label: true },
      },
      subtasks: true,
      column: true,
      project: true,
    },
  });

  revalidatePath("/");
  return task;
}

export async function deleteTask(id: string) {
  await prisma.task.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function toggleComplete(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      project: {
        include: {
          columns: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
    },
  });

  if (!task) throw new Error("Task not found");

  const isCompleting = task.completedAt === null;
  const doneColumn = task.project.columns.find((c) => c.isDone);
  const defaultColumn = task.project.columns.find((c) => c.isDefault);

  const targetColumnId = isCompleting
    ? doneColumn?.id ?? task.columnId
    : defaultColumn?.id ?? task.columnId;

  const updated = await prisma.task.update({
    where: { id },
    data: {
      completedAt: isCompleting ? new Date() : null,
      columnId: targetColumnId,
    },
    include: {
      labels: {
        include: { label: true },
      },
      subtasks: true,
      column: true,
      project: true,
    },
  });

  revalidatePath("/");
  return updated;
}

export async function moveTask(
  taskId: string,
  columnId: string,
  sortOrder: number
) {
  const column = await prisma.column.findUnique({ where: { id: columnId } });
  if (!column) throw new Error("Column not found");

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      columnId,
      sortOrder,
      completedAt: column.isDone ? new Date() : null,
    },
  });

  revalidatePath("/");
  return task;
}

export async function reorderTasks(columnId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.task.update({
        where: { id },
        data: { sortOrder: index, columnId },
      })
    )
  );

  revalidatePath("/");
}

export async function createSubtask(parentId: string, title: string) {
  if (!title.trim()) throw new Error("Title is required");

  const parent = await prisma.task.findUnique({ where: { id: parentId } });
  if (!parent) throw new Error("Parent task not found");

  const maxSortOrder = await prisma.task.aggregate({
    where: { parentId },
    _max: { sortOrder: true },
  });
  const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

  const subtask = await prisma.task.create({
    data: {
      title: title.trim(),
      projectId: parent.projectId,
      columnId: parent.columnId,
      parentId,
      sortOrder: nextSortOrder,
      priority: parent.priority,
    },
  });

  revalidatePath("/");
  return subtask;
}

export async function searchTasks(query: string) {
  if (!query.trim()) return [];

  const tasks = await prisma.task.findMany({
    where: {
      title: { contains: query.trim() },
      parentId: null,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      labels: {
        include: { label: true },
      },
      subtasks: true,
      column: true,
      project: true,
    },
    take: 20,
  });

  return tasks;
}
