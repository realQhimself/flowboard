"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DEFAULT_COLUMNS } from "@/lib/constants";

const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  color: z.string().min(1).default("#6366f1"),
  icon: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").optional(),
  description: z.string().optional(),
  color: z.string().min(1).optional(),
  icon: z.string().optional(),
  archived: z.boolean().optional(),
});

export async function getProjects() {
  const projects = await prisma.project.findMany({
    where: { archived: false },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { tasks: true },
      },
      tasks: {
        select: {
          completedAt: true,
        },
        where: {
          parentId: null,
        },
      },
    },
  });

  return projects.map((project) => {
    const totalTasks = project.tasks.length;
    const completedCount = project.tasks.filter(
      (t) => t.completedAt !== null
    ).length;
    const { tasks: _tasks, ...rest } = project;
    return {
      ...rest,
      completedCount,
      totalTasks,
    };
  });
}

export async function getProject(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      columns: {
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
      },
    },
  });

  return project;
}

export async function createProject(data: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}) {
  const validated = createProjectSchema.parse(data);

  const maxSortOrder = await prisma.project.aggregate({
    _max: { sortOrder: true },
  });
  const nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

  const project = await prisma.project.create({
    data: {
      name: validated.name,
      description: validated.description,
      color: validated.color,
      icon: validated.icon,
      sortOrder: nextSortOrder,
      columns: {
        create: DEFAULT_COLUMNS.map((col) => ({
          name: col.name,
          color: col.color,
          sortOrder: col.sortOrder,
          isDefault: col.isDefault,
          isDone: col.isDone,
        })),
      },
    },
    include: {
      columns: true,
    },
  });

  revalidatePath("/");
  return project;
}

export async function updateProject(
  id: string,
  data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    archived?: boolean;
  }
) {
  const validated = updateProjectSchema.parse(data);

  const project = await prisma.project.update({
    where: { id },
    data: validated,
  });

  revalidatePath("/");
  return project;
}

export async function deleteProject(id: string) {
  await prisma.project.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function reorderProjects(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.project.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath("/");
}
