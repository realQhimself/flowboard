"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createColumnSchema = z.object({
  projectId: z.string().min(1, "Project is required"),
  name: z.string().min(1, "Column name is required"),
  color: z.string().min(1).default("#94a3b8"),
});

const updateColumnSchema = z.object({
  name: z.string().min(1, "Column name is required").optional(),
  color: z.string().min(1).optional(),
});

export async function getColumns(projectId: string) {
  const columns = await prisma.column.findMany({
    where: { projectId },
    orderBy: { sortOrder: "asc" },
    include: {
      tasks: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
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
      },
    },
  });

  return columns;
}

export async function createColumn(
  projectId: string,
  name: string,
  color?: string
) {
  const validated = createColumnSchema.parse({ projectId, name, color });

  const maxSortOrder = await prisma.column.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  });
  const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

  const column = await prisma.column.create({
    data: {
      name: validated.name,
      color: validated.color,
      sortOrder: nextSortOrder,
      projectId: validated.projectId,
    },
    include: {
      tasks: {
        where: { parentId: null },
        orderBy: { sortOrder: "asc" },
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
      },
    },
  });

  revalidatePath("/");
  return column;
}

export async function updateColumn(
  id: string,
  data: { name?: string; color?: string }
) {
  const validated = updateColumnSchema.parse(data);

  const column = await prisma.column.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/");
  return column;
}

export async function deleteColumn(id: string) {
  const column = await prisma.column.findUnique({
    where: { id },
    include: {
      tasks: { select: { id: true } },
      project: {
        include: {
          columns: {
            where: { isDefault: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!column) throw new Error("Column not found");

  if (column.isDefault) {
    throw new Error("Cannot delete the default column");
  }

  // If column has tasks, move them to the default column
  if (column.tasks.length > 0) {
    const defaultColumn = column.project.columns[0];
    if (defaultColumn) {
      const maxSortOrder = await prisma.task.aggregate({
        where: { columnId: defaultColumn.id, parentId: null },
        _max: { sortOrder: true },
      });
      let nextSort = (maxSortOrder._max.sortOrder ?? -1) + 1;

      await prisma.$transaction(
        column.tasks.map((task) =>
          prisma.task.update({
            where: { id: task.id },
            data: { columnId: defaultColumn.id, sortOrder: nextSort++ },
          })
        )
      );
    }
  }

  await prisma.column.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function reorderColumns(projectId: string, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.column.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath("/");
}
