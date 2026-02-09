"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createLabelSchema = z.object({
  name: z.string().min(1, "Label name is required"),
  color: z.string().min(1, "Color is required").default("#8b5cf6"),
});

export async function getLabels() {
  const labels = await prisma.label.findMany({
    orderBy: { name: "asc" },
  });

  return labels;
}

export async function createLabel(data: { name: string; color?: string }) {
  const validated = createLabelSchema.parse(data);

  const label = await prisma.label.create({
    data: {
      name: validated.name,
      color: validated.color,
    },
  });

  revalidatePath("/");
  return label;
}

export async function deleteLabel(id: string) {
  await prisma.label.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function toggleTaskLabel(taskId: string, labelId: string) {
  const existing = await prisma.taskLabel.findUnique({
    where: {
      taskId_labelId: { taskId, labelId },
    },
  });

  if (existing) {
    await prisma.taskLabel.delete({
      where: {
        taskId_labelId: { taskId, labelId },
      },
    });
  } else {
    await prisma.taskLabel.create({
      data: { taskId, labelId },
    });
  }

  revalidatePath("/");
}
