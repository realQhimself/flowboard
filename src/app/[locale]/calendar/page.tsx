"use client";

import { useTranslations } from "next-intl";
import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  const t = useTranslations("calendar");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>
      <CalendarView />
    </div>
  );
}
