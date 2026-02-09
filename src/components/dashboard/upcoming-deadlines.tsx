"use client";

import { useTranslations, useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { PRIORITIES } from "@/lib/constants";
import { Link } from "@/i18n/routing";

interface DeadlineTask {
  id: string;
  title: string;
  priority: number;
  dueDate: string;
  project: { id: string; name: string; color: string };
}

interface UpcomingDeadlinesProps {
  tasks: DeadlineTask[];
  hasMore: boolean;
}

function formatDueLabel(
  dateStr: string,
  locale: string,
  dateLocale: Locale
): { text: string; className: string } {
  const date = parseISO(dateStr);
  if (isToday(date)) {
    return {
      text: locale === "zh" ? "今天" : "Today",
      className: "text-amber-600 dark:text-amber-400 font-medium",
    };
  }
  if (isTomorrow(date)) {
    return {
      text: locale === "zh" ? "明天" : "Tomorrow",
      className: "text-blue-600 dark:text-blue-400",
    };
  }
  return {
    text: format(date, "MMM d", { locale: dateLocale }),
    className: "text-muted-foreground",
  };
}

type Locale = typeof enUS;

export function UpcomingDeadlines({ tasks, hasMore }: UpcomingDeadlinesProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const dateLocale = locale === "zh" ? zhCN : enUS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">
              {t("upcomingDeadlines")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
              <CalendarCheck className="size-10 opacity-40" />
              <p className="text-sm">{t("nothingDue")}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {tasks.map((task) => {
                const priority = PRIORITIES.find(
                  (p) => p.value === task.priority
                );
                const due = formatDueLabel(task.dueDate, locale, dateLocale);

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors group"
                  >
                    {/* Priority dot */}
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: priority?.color ?? "#94a3b8" }}
                    />

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                        <span
                          className="inline-block size-1.5 rounded-full mr-1 relative top-[-1px]"
                          style={{ backgroundColor: task.project.color }}
                        />
                        {task.project.name}
                      </p>
                    </div>

                    {/* Due date */}
                    <span className={cn("text-xs whitespace-nowrap shrink-0", due.className)}>
                      {due.text}
                    </span>
                  </div>
                );
              })}

              {hasMore && (
                <Link
                  href="/todos"
                  className="flex items-center justify-center gap-1 pt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span>{locale === "zh" ? "查看全部" : "View all"}</span>
                  <ArrowRight className="size-3" />
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
