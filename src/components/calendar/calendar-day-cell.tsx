"use client";

import { isToday, isSameMonth, format } from "date-fns";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CalendarTaskPill } from "./calendar-task-pill";
import { CalendarEventPill } from "./calendar-event-pill";
import type { CalendarEvent } from "@/types";
import type { TaskWithRelations } from "@/types";

interface CalendarDayCellProps {
  date: Date;
  currentMonth: Date;
  tasks: TaskWithRelations[];
  events: CalendarEvent[];
  onClickEmpty: (date: Date) => void;
  onClickTask: (task: TaskWithRelations) => void;
  onClickEvent: (event: CalendarEvent) => void;
  isWeekView?: boolean;
}

const MAX_ITEMS_MONTH = 3;
const MAX_ITEMS_WEEK = 8;

export function CalendarDayCell({
  date,
  currentMonth,
  tasks,
  events,
  onClickEmpty,
  onClickTask,
  onClickEvent,
  isWeekView = false,
}: CalendarDayCellProps) {
  const t = useTranslations("calendar");
  const today = isToday(date);
  const sameMonth = isSameMonth(date, currentMonth);
  const dayNumber = format(date, "d");
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const allItems = [
    ...events.map((e) => ({ type: "event" as const, data: e, key: `e-${e.id}` })),
    ...tasks.map((t) => ({ type: "task" as const, data: t, key: `t-${t.id}` })),
  ];

  const maxItems = isWeekView ? MAX_ITEMS_WEEK : MAX_ITEMS_MONTH;
  const visibleItems = allItems.slice(0, maxItems);
  const overflowCount = allItems.length - maxItems;

  return (
    <div
      className={cn(
        "group relative flex flex-col border-r border-b transition-colors cursor-pointer",
        isWeekView ? "min-h-[180px]" : "min-h-[100px]",
        !sameMonth && "opacity-50",
        today && "bg-primary/5",
        isWeekend && !today && "bg-muted/30",
        "hover:bg-accent/30"
      )}
      onClick={() => onClickEmpty(date)}
    >
      {/* Day Number */}
      <div className="flex justify-end p-1">
        <span
          className={cn(
            "flex items-center justify-center text-xs font-medium",
            today
              ? "size-6 rounded-full bg-primary text-primary-foreground"
              : "size-6 text-foreground",
            !sameMonth && "text-muted-foreground"
          )}
        >
          {dayNumber}
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-1 flex-col gap-0.5 px-1 pb-1">
        {visibleItems.map((item) =>
          item.type === "event" ? (
            <CalendarEventPill
              key={item.key}
              event={item.data as CalendarEvent}
              onClick={onClickEvent}
              compact={!isWeekView}
            />
          ) : (
            <CalendarTaskPill
              key={item.key}
              task={item.data as TaskWithRelations}
              onClick={onClickTask}
              compact={!isWeekView}
            />
          )
        )}

        {overflowCount > 0 && (
          <span className="px-1.5 text-[10px] text-muted-foreground font-medium">
            {t("more", { count: overflowCount })}
          </span>
        )}
      </div>
    </div>
  );
}
