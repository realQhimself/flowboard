export const PRIORITIES = [
  { value: 1, label: "Urgent", color: "#ef4444" },
  { value: 2, label: "High", color: "#f97316" },
  { value: 3, label: "Medium", color: "#eab308" },
  { value: 4, label: "Low", color: "#94a3b8" },
] as const;

export const DEFAULT_COLUMNS = [
  { name: "Backlog", color: "#94a3b8", sortOrder: 0, isDefault: true, isDone: false },
  { name: "In Progress", color: "#3b82f6", sortOrder: 1, isDefault: false, isDone: false },
  { name: "Review", color: "#f59e0b", sortOrder: 2, isDefault: false, isDone: false },
  { name: "Done", color: "#22c55e", sortOrder: 3, isDefault: false, isDone: true },
] as const;

export const PROJECT_COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#06b6d4",
  "#3b82f6", "#2563eb",
] as const;

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
