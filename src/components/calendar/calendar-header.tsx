"use client";

import { format } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "month" | "week";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onNewEvent: () => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPrevious,
  onNext,
  onToday,
  onViewModeChange,
  onNewEvent,
}: CalendarHeaderProps) {
  const t = useTranslations("calendar");
  const locale = useLocale();
  const dateFnsLocale = locale === "zh" ? zhCN : enUS;

  const headerLabel =
    locale === "zh"
      ? format(currentDate, "yyyy年M月", { locale: dateFnsLocale })
      : format(currentDate, "MMMM yyyy", { locale: dateFnsLocale });

  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      {/* Left: Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon-sm" onClick={onPrevious}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="outline" size="icon-sm" onClick={onNext}>
          <ChevronRight className="size-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={onToday}>
          {t("today")}
        </Button>
        <h2 className="ml-2 text-lg font-semibold tracking-tight">
          {headerLabel}
        </h2>
      </div>

      {/* Right: View Toggle + New Event */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-md border">
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "rounded-r-none border-0",
              viewMode === "month" && "pointer-events-none"
            )}
            onClick={() => onViewModeChange("month")}
          >
            {t("month")}
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            className={cn(
              "rounded-l-none border-0",
              viewMode === "week" && "pointer-events-none"
            )}
            onClick={() => onViewModeChange("week")}
          >
            {t("week")}
          </Button>
        </div>
        <Button size="sm" onClick={onNewEvent}>
          <Plus className="size-4" />
          {t("newEvent")}
        </Button>
      </div>
    </div>
  );
}
