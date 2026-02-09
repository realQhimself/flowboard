"use client";

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isToday,
  isSameDay,
} from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { CalendarDayCell } from "./calendar-day-cell";
import type { CalendarEvent } from "@/types";
import type { TaskWithRelations } from "@/types";

interface CalendarWeekGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  tasks: TaskWithRelations[];
  onClickEmptyDay: (date: Date) => void;
  onClickTask: (task: TaskWithRelations) => void;
  onClickEvent: (event: CalendarEvent) => void;
}

export function CalendarWeekGrid({
  currentDate,
  events,
  tasks,
  onClickEmptyDay,
  onClickTask,
  onClickEvent,
}: CalendarWeekGridProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const dateFnsLocale = locale === "zh" ? zhCN : enUS;

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const dayLabels = [
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
      {/* Column Headers */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {days.map((day, i) => {
          const today = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2",
                i < 6 && "border-r",
                today && "bg-primary/5"
              )}
            >
              <span className="text-[10px] font-medium uppercase text-muted-foreground">
                {dayLabels[i]}
              </span>
              <span
                className={cn(
                  "flex items-center justify-center text-sm font-semibold",
                  today
                    ? "size-7 rounded-full bg-primary text-primary-foreground"
                    : "text-foreground"
                )}
              >
                {format(day, "d")}
              </span>
            </div>
          );
        })}
      </div>

      {/* Day Columns */}
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
            isWeekView
          />
        ))}
      </div>
    </div>
  );
}
