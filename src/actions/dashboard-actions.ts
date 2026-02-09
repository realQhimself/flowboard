"use server";

import { prisma } from "@/lib/prisma";
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  format,
} from "date-fns";
import { PRIORITIES } from "@/lib/constants";

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [totalTasks, completedToday, overdue, dueThisWeek] = await Promise.all(
    [
      prisma.task.count({
        where: { archived: false, parentId: null },
      }),
      prisma.task.count({
        where: {
          completedAt: { gte: todayStart, lte: todayEnd },
          parentId: null,
        },
      }),
      prisma.task.count({
        where: {
          dueDate: { lt: todayStart },
          completedAt: null,
          archived: false,
          parentId: null,
        },
      }),
      prisma.task.count({
        where: {
          dueDate: { gte: weekStart, lte: weekEnd },
          completedAt: null,
          archived: false,
          parentId: null,
        },
      }),
    ]
  );

  return { totalTasks, completedToday, overdue, dueThisWeek };
}

export async function getCompletionHistory(days = 30) {
  const now = new Date();
  const startDate = startOfDay(subDays(now, days - 1));

  const completedTasks = await prisma.task.findMany({
    where: {
      completedAt: { gte: startDate },
      parentId: null,
    },
    select: { completedAt: true },
  });

  // Build a map of date -> count
  const countMap = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const date = subDays(now, days - 1 - i);
    countMap.set(format(date, "yyyy-MM-dd"), 0);
  }

  for (const task of completedTasks) {
    if (task.completedAt) {
      const key = format(task.completedAt, "yyyy-MM-dd");
      if (countMap.has(key)) {
        countMap.set(key, (countMap.get(key) ?? 0) + 1);
      }
    }
  }

  return Array.from(countMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

export async function getPriorityBreakdown() {
  const counts = await prisma.task.groupBy({
    by: ["priority"],
    where: {
      completedAt: null,
      archived: false,
      parentId: null,
    },
    _count: { id: true },
  });

  return PRIORITIES.map((p) => {
    const found = counts.find((c) => c.priority === p.value);
    return {
      priority: p.value,
      label: p.label,
      count: found?._count?.id ?? 0,
      color: p.color,
    };
  });
}

export async function getUpcomingDeadlines(limit = 8) {
  const now = startOfDay(new Date());

  const tasks = await prisma.task.findMany({
    where: {
      dueDate: { gte: now },
      completedAt: null,
      archived: false,
      parentId: null,
    },
    orderBy: { dueDate: "asc" },
    take: limit + 1,
    include: {
      project: { select: { id: true, name: true, color: true } },
    },
  });

  const hasMore = tasks.length > limit;
  const items = tasks.slice(0, limit);

  return {
    tasks: items.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.dueDate!.toISOString(),
      project: t.project,
    })),
    hasMore,
  };
}

export async function getProjectProgress() {
  const projects = await prisma.project.findMany({
    where: { archived: false },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      color: true,
      _count: {
        select: {
          tasks: {
            where: { parentId: null },
          },
        },
      },
    },
  });

  // Get completed counts per project
  const completedCounts = await prisma.task.groupBy({
    by: ["projectId"],
    where: {
      completedAt: { not: null },
      parentId: null,
    },
    _count: { id: true },
  });

  const completedMap = new Map(
    completedCounts.map((c) => [c.projectId, c._count.id])
  );

  return projects
    .map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      totalTasks: p._count.tasks,
      completedTasks: completedMap.get(p.id) ?? 0,
    }))
    .sort((a, b) => b.totalTasks - a.totalTasks);
}
