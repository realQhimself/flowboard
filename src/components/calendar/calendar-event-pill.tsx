"use client";

import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { CalendarEvent } from "@/types";

interface CalendarEventPillProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  compact?: boolean;
}

export function CalendarEventPill({ event, onClick, compact = false }: CalendarEventPillProps) {
  const eventColor = event.color ?? "#6366f1";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={cn(
        "group flex w-full items-center gap-1.5 rounded-md px-1.5 text-left transition-colors hover:opacity-90",
        compact ? "h-5 text-[10px]" : "h-6 text-xs"
      )}
      style={{
        backgroundColor: `${eventColor}20`,
        color: eventColor,
      }}
    >
      {!event.allDay && (
        <Clock className={cn("shrink-0", compact ? "size-2.5" : "size-3")} />
      )}
      {event.allDay && (
        <span
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: eventColor }}
        />
      )}
      <span className="truncate font-medium leading-tight">
        {event.title}
      </span>
    </button>
  );
}
