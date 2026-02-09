"use client";

import { useState, useEffect, useCallback } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay,
  endOfDay,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarHeader } from "./calendar-header";
import { CalendarMonthGrid } from "./calendar-month-grid";
import { CalendarWeekGrid } from "./calendar-week-grid";
import { CalendarEventModal } from "./calendar-event-modal";
import { getEventsForRange, getTasksForRange } from "@/actions/calendar-actions";
import type { CalendarEvent } from "@/types";
import type { TaskWithRelations } from "@/types";

type ViewMode = "month" | "week";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [defaultEventDate, setDefaultEventDate] = useState<Date>(new Date());

  // Track animation direction
  const [direction, setDirection] = useState(0);

  const getDateRange = useCallback(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return {
        start: startOfDay(startOfWeek(monthStart, { weekStartsOn: 0 })),
        end: endOfDay(endOfWeek(monthEnd, { weekStartsOn: 0 })),
      };
    } else {
      return {
        start: startOfDay(startOfWeek(currentDate, { weekStartsOn: 0 })),
        end: endOfDay(endOfWeek(currentDate, { weekStartsOn: 0 })),
      };
    }
  }, [currentDate, viewMode]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();
      const [eventsData, tasksData] = await Promise.all([
        getEventsForRange(start, end),
        getTasksForRange(start, end),
      ]);
      setEvents(eventsData);
      setTasks(tasksData as TaskWithRelations[]);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [getDateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrevious = () => {
    setDirection(-1);
    if (viewMode === "month") {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else {
      setCurrentDate((prev) => subWeeks(prev, 1));
    }
  };

  const handleNext = () => {
    setDirection(1);
    if (viewMode === "month") {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else {
      setCurrentDate((prev) => addWeeks(prev, 1));
    }
  };

  const handleToday = () => {
    setDirection(0);
    setCurrentDate(new Date());
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleNewEvent = () => {
    setEditingEvent(null);
    setDefaultEventDate(new Date());
    setModalOpen(true);
  };

  const handleClickEmptyDay = (date: Date) => {
    setEditingEvent(null);
    setDefaultEventDate(date);
    setModalOpen(true);
  };

  const handleClickEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setDefaultEventDate(new Date(event.date));
    setModalOpen(true);
  };

  const handleClickTask = (_task: TaskWithRelations) => {
    // Tasks could open a task detail modal in the future.
    // For now, no-op.
  };

  const handleSaved = () => {
    fetchData();
  };

  const animationVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : dir < 0 ? -40 : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : dir < 0 ? 40 : 0,
      opacity: 0,
    }),
  };

  const gridKey = `${viewMode}-${currentDate.toISOString()}`;

  return (
    <div className="flex flex-col gap-0">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewModeChange={handleViewModeChange}
        onNewEvent={handleNewEvent}
      />

      <div className="relative min-h-[500px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={gridKey}
            custom={direction}
            variants={animationVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {viewMode === "month" ? (
              <CalendarMonthGrid
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                onClickEmptyDay={handleClickEmptyDay}
                onClickTask={handleClickTask}
                onClickEvent={handleClickEvent}
              />
            ) : (
              <CalendarWeekGrid
                currentDate={currentDate}
                events={events}
                tasks={tasks}
                onClickEmptyDay={handleClickEmptyDay}
                onClickTask={handleClickTask}
                onClickEvent={handleClickEvent}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CalendarEventModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        event={editingEvent}
        defaultDate={defaultEventDate}
        onSaved={handleSaved}
      />
    </div>
  );
}
