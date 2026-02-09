"use client";

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CalendarDayCell } from "./calendar-day-cell";
import type { CalendarEvent } from "@/types";
import type { TaskWithRelations } from "@/types";

interface CalendarMonthGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: TaskWithRelations[];
  onClickEmptyDay: (date: Date) => void;
  onClickTask: (task: TaskWithRelations) => void;
  onClickEvent: (event: CalendarEvent) => void;
}

export function CalendarMonthGrid({
  currentDate,
  events,
  tasks,
  onClickEmptyDay,
  onClickTask,
  onClickEvent,
}: CalendarMonthGridProps) {
  const t = useTranslations("calendar");

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const dayNames = [
    t("sun"),
    t("mon"),
    t("tue"),
    t("wed"),
    t("thu"),
    t("fri"),
    t("sat"),
  ];

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), day));

  const getTasksForDay = (day: Date) =>
    tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), day));

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border">
      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {dayNames.map((name, i) => (
          <div
            key={name}
            className={cn(
              "py-2 text-center text-xs font-medium text-muted-foreground",
              i < 6 && "border-r"
            )}
          >
            {name}
          </div>
        ))}
      </div>

      {/* Day Cells */}
      <div className="grid grid-cols-7">
        {days.map((day) => (
          <CalendarDayCell
            key={day.toISOString()}
            date={day}
            currentMonth={currentDate}
            tasks={getTasksForDay(day)}
            events={getEventsForDay(day)}
            onClickEmpty={onClickEmptyDay}
            onClickTask={onClickTask}
            onClickEvent={onClickEvent}
          />
        ))}
      </div>
    </div>
  );
}
