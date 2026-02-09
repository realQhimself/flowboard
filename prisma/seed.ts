import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: "file:prisma/dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.taskLabel.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.label.deleteMany();
  await prisma.project.deleteMany();

  // Create labels
  const labels = await Promise.all([
    prisma.label.create({ data: { name: "Bug", color: "#ef4444" } }),
    prisma.label.create({ data: { name: "Feature", color: "#3b82f6" } }),
    prisma.label.create({ data: { name: "Design", color: "#a855f7" } }),
    prisma.label.create({ data: { name: "Documentation", color: "#22c55e" } }),
    prisma.label.create({ data: { name: "Research", color: "#f59e0b" } }),
  ]);

  // Create Project 1: FlowBoard App
  const project1 = await prisma.project.create({
    data: {
      name: "FlowBoard App",
      description: "Building the project management tool",
      color: "#6366f1",
      sortOrder: 0,
    },
  });

  const p1Cols = await Promise.all([
    prisma.column.create({ data: { name: "Backlog", color: "#94a3b8", sortOrder: 0, isDefault: true, isDone: false, projectId: project1.id } }),
    prisma.column.create({ data: { name: "In Progress", color: "#3b82f6", sortOrder: 1, isDefault: false, isDone: false, projectId: project1.id } }),
    prisma.column.create({ data: { name: "Review", color: "#f59e0b", sortOrder: 2, isDefault: false, isDone: false, projectId: project1.id } }),
    prisma.column.create({ data: { name: "Done", color: "#22c55e", sortOrder: 3, isDefault: false, isDone: true, projectId: project1.id } }),
  ]);

  // Create Project 2: Marketing Website
  const project2 = await prisma.project.create({
    data: {
      name: "Marketing Website",
      description: "Company website redesign",
      color: "#ec4899",
      sortOrder: 1,
    },
  });

  const p2Cols = await Promise.all([
    prisma.column.create({ data: { name: "Backlog", color: "#94a3b8", sortOrder: 0, isDefault: true, isDone: false, projectId: project2.id } }),
    prisma.column.create({ data: { name: "In Progress", color: "#3b82f6", sortOrder: 1, isDefault: false, isDone: false, projectId: project2.id } }),
    prisma.column.create({ data: { name: "Review", color: "#f59e0b", sortOrder: 2, isDefault: false, isDone: false, projectId: project2.id } }),
    prisma.column.create({ data: { name: "Done", color: "#22c55e", sortOrder: 3, isDefault: false, isDone: true, projectId: project2.id } }),
  ]);

  // Create Project 3: Mobile App
  const project3 = await prisma.project.create({
    data: {
      name: "Mobile App",
      description: "iOS and Android companion app",
      color: "#14b8a6",
      sortOrder: 2,
    },
  });

  const p3Cols = await Promise.all([
    prisma.column.create({ data: { name: "Backlog", color: "#94a3b8", sortOrder: 0, isDefault: true, isDone: false, projectId: project3.id } }),
    prisma.column.create({ data: { name: "In Progress", color: "#3b82f6", sortOrder: 1, isDefault: false, isDone: false, projectId: project3.id } }),
    prisma.column.create({ data: { name: "Done", color: "#22c55e", sortOrder: 2, isDefault: false, isDone: true, projectId: project3.id } }),
  ]);

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today); twoDaysAgo.setDate(today.getDate() - 2);
  const threeDaysAgo = new Date(today); threeDaysAgo.setDate(today.getDate() - 3);
  const inThreeDays = new Date(today); inThreeDays.setDate(today.getDate() + 3);
  const inFiveDays = new Date(today); inFiveDays.setDate(today.getDate() + 5);

  // Project 1 tasks
  const tasks1 = [
    { title: "Set up CI/CD pipeline", priority: 2, columnId: p1Cols[0].id, sortOrder: 0, dueDate: inThreeDays },
    { title: "Add dark mode support", priority: 3, columnId: p1Cols[0].id, sortOrder: 1, dueDate: nextWeek },
    { title: "Implement drag-and-drop", priority: 1, columnId: p1Cols[1].id, sortOrder: 0, dueDate: tomorrow },
    { title: "Design dashboard charts", priority: 2, columnId: p1Cols[1].id, sortOrder: 1, dueDate: inFiveDays },
    { title: "Write API documentation", priority: 3, columnId: p1Cols[2].id, sortOrder: 0, dueDate: today },
    { title: "Fix sidebar collapse bug", priority: 1, columnId: p1Cols[3].id, sortOrder: 0, completedAt: yesterday },
    { title: "Set up Prisma schema", priority: 2, columnId: p1Cols[3].id, sortOrder: 1, completedAt: twoDaysAgo },
    { title: "Create project structure", priority: 2, columnId: p1Cols[3].id, sortOrder: 2, completedAt: threeDaysAgo },
  ];

  for (const task of tasks1) {
    const created = await prisma.task.create({
      data: { ...task, projectId: project1.id },
    });
    // Add some labels
    if (task.title.includes("bug") || task.title.includes("Fix")) {
      await prisma.taskLabel.create({ data: { taskId: created.id, labelId: labels[0].id } });
    }
    if (task.title.includes("Design") || task.title.includes("dashboard")) {
      await prisma.taskLabel.create({ data: { taskId: created.id, labelId: labels[2].id } });
    }
    if (task.title.includes("documentation") || task.title.includes("Write")) {
      await prisma.taskLabel.create({ data: { taskId: created.id, labelId: labels[3].id } });
    }
  }

  // Project 2 tasks
  const tasks2 = [
    { title: "Design hero section", priority: 2, columnId: p2Cols[0].id, sortOrder: 0, dueDate: inFiveDays },
    { title: "Write copy for landing page", priority: 3, columnId: p2Cols[0].id, sortOrder: 1, dueDate: nextWeek },
    { title: "Implement responsive navbar", priority: 2, columnId: p2Cols[1].id, sortOrder: 0, dueDate: tomorrow },
    { title: "Add contact form", priority: 3, columnId: p2Cols[1].id, sortOrder: 1, dueDate: inThreeDays },
    { title: "Set up analytics", priority: 4, columnId: p2Cols[0].id, sortOrder: 2 },
    { title: "Create logo variations", priority: 1, columnId: p2Cols[3].id, sortOrder: 0, completedAt: yesterday },
  ];

  for (const task of tasks2) {
    await prisma.task.create({
      data: { ...task, projectId: project2.id },
    });
  }

  // Project 3 tasks
  const tasks3 = [
    { title: "Research React Native", priority: 3, columnId: p3Cols[0].id, sortOrder: 0, dueDate: nextWeek },
    { title: "Set up Expo project", priority: 2, columnId: p3Cols[0].id, sortOrder: 1 },
    { title: "Design app wireframes", priority: 1, columnId: p3Cols[1].id, sortOrder: 0, dueDate: today },
    { title: "Define API endpoints", priority: 2, columnId: p3Cols[0].id, sortOrder: 2, dueDate: inFiveDays },
  ];

  for (const task of tasks3) {
    await prisma.task.create({
      data: { ...task, projectId: project3.id },
    });
  }

  // Calendar events
  await prisma.calendarEvent.create({
    data: { title: "Team Standup", date: today, allDay: false, color: "#6366f1" },
  });
  await prisma.calendarEvent.create({
    data: { title: "Design Review", date: tomorrow, allDay: false, color: "#a855f7" },
  });
  await prisma.calendarEvent.create({
    data: { title: "Sprint Planning", date: nextWeek, allDay: false, color: "#3b82f6" },
  });
  await prisma.calendarEvent.create({
    data: { title: "Launch Day!", date: inFiveDays, allDay: true, color: "#22c55e" },
  });

  console.log("Seed complete!");
  console.log(`Created 3 projects, ${tasks1.length + tasks2.length + tasks3.length} tasks, ${labels.length} labels, 4 calendar events`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
