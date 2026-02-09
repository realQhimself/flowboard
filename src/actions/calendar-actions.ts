"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  date: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  allDay: z.boolean().default(true),
  color: z.string().default("#6366f1"),
});

const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional().nullable(),
  date: z.coerce.date().optional(),
  endDate: z.coerce.date().optional().nullable(),
  allDay: z.boolean().optional(),
  color: z.string().optional(),
});

export async function getEventsForRange(start: Date, end: Date) {
  const events = await prisma.calendarEvent.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { date: "asc" },
  });

  return events;
}

export async function getTasksForRange(start: Date, end: Date) {
  const tasks = await prisma.task.findMany({
    where: {
      dueDate: {
        gte: start,
        lte: end,
      },
      parentId: null,
    },
    orderBy: { dueDate: "asc" },
    include: {
      project: true,
      labels: {
        include: { label: true },
      },
      column: true,
      subtasks: true,
    },
  });

  return tasks;
}

export async function createEvent(data: {
  title: string;
  description?: string | null;
  date: Date | string;
  endDate?: Date | string | null;
  allDay?: boolean;
  color?: string;
}) {
  const validated = createEventSchema.parse(data);

  const event = await prisma.calendarEvent.create({
    data: {
      title: validated.title,
      description: validated.description,
      date: validated.date,
      endDate: validated.endDate,
      allDay: validated.allDay,
      color: validated.color,
    },
  });

  revalidatePath("/");
  return event;
}

export async function updateEvent(
  id: string,
  data: {
    title?: string;
    description?: string | null;
    date?: Date | string;
    endDate?: Date | string | null;
    allDay?: boolean;
    color?: string;
  }
) {
  const validated = updateEventSchema.parse(data);

  const event = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...validated,
      endDate: data.endDate === null ? null : validated.endDate,
    },
  });

  revalidatePath("/");
  return event;
}

export async function deleteEvent(id: string) {
  await prisma.calendarEvent.delete({
    where: { id },
  });

  revalidatePath("/");
}

export async function rescheduleTask(taskId: string, newDate: Date) {
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      dueDate: newDate,
    },
    include: {
      project: true,
      labels: {
        include: { label: true },
      },
      column: true,
      subtasks: true,
    },
  });

  revalidatePath("/");
  return task;
}
