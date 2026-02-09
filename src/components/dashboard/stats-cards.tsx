"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function StatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations("dashboard");

  const cards = [
    {
      key: "totalTasks" as const,
      value: stats.totalTasks,
      icon: ClipboardList,
      iconBg: "bg-blue-100 dark:bg-blue-950",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      key: "completedToday" as const,
      value: stats.completedToday,
      icon: CheckCircle,
      iconBg: "bg-emerald-100 dark:bg-emerald-950",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      key: "overdue" as const,
      value: stats.overdue,
      icon: AlertCircle,
      iconBg: "bg-red-100 dark:bg-red-950",
      iconColor: "text-red-600 dark:text-red-400",
      highlight: stats.overdue > 0,
    },
    {
      key: "dueThisWeek" as const,
      value: stats.dueThisWeek,
      icon: Clock,
      iconBg: "bg-amber-100 dark:bg-amber-950",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <motion.div key={card.key} variants={item}>
            <Card
              className={cn(
                "transition-shadow hover:shadow-md py-4",
                card.highlight &&
                  "border-red-200 dark:border-red-900/50"
              )}
            >
              <CardContent className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex items-center justify-center size-10 rounded-lg shrink-0",
                    card.iconBg
                  )}
                >
                  <Icon className={cn("size-5", card.iconColor)} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {t(card.key)}
                  </p>
                  <p
                    className={cn(
                      "text-3xl font-bold tracking-tight",
                      card.highlight && "text-red-600 dark:text-red-400"
                    )}
                  >
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
