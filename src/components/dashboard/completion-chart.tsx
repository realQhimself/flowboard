"use client";

import { useTranslations, useLocale } from "next-intl";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { enUS, zhCN } from "date-fns/locale";
import type { CompletionDataPoint } from "@/types";

interface CompletionChartProps {
  data: CompletionDataPoint[];
}

export function CompletionChart({ data }: CompletionChartProps) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const dateLocale = locale === "zh" ? zhCN : enUS;

  const totalCompleted = data.reduce((sum, d) => sum + d.count, 0);

  const chartData = data.map((d) => ({
    ...d,
    label: format(parseISO(d.date), "MMM d", { locale: dateLocale }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">{t("completionTrend")}</CardTitle>
          </div>
          <CardDescription>
            {t("last30Days")} &middot; {totalCompleted} {t("tasksCompleted")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalCompleted === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
              {t("noData")}
            </div>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border)"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    minTickGap={40}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
                          <p className="font-medium text-popover-foreground">
                            {format(parseISO(d.date), "PPP", { locale: dateLocale })}
                          </p>
                          <p className="text-muted-foreground">
                            {d.count} {t("tasksCompleted")}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="url(#completionGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
