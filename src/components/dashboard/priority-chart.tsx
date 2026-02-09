"use client";

import { useTranslations } from "next-intl";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import type { PriorityDataPoint } from "@/types";

interface PriorityChartProps {
  data: PriorityDataPoint[];
}

const PRIORITY_LABELS: Record<number, string> = {
  1: "P1",
  2: "P2",
  3: "P3",
  4: "P4",
};

export function PriorityChart({ data }: PriorityChartProps) {
  const t = useTranslations("dashboard");
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const filteredData = data.filter((d) => d.count > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">
              {t("priorityBreakdown")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <div className="flex items-center justify-center h-[240px] text-muted-foreground text-sm">
              {t("noData")}
            </div>
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="label"
                    strokeWidth={0}
                  >
                    {filteredData.map((entry) => (
                      <Cell
                        key={entry.priority}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  {/* Center text */}
                  <text
                    x="50%"
                    y="42%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-foreground text-2xl font-bold"
                    style={{ fontSize: 24, fontWeight: 700 }}
                  >
                    {total}
                  </text>
                  <text
                    x="50%"
                    y="52%"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-muted-foreground text-xs"
                    style={{ fontSize: 11 }}
                  >
                    tasks
                  </text>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as PriorityDataPoint;
                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: d.color }}
                            />
                            <span className="font-medium text-popover-foreground">
                              {PRIORITY_LABELS[d.priority]} &middot; {d.label}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-0.5">
                            {d.count} task{d.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    content={() => (
                      <div className="flex items-center justify-center gap-4 pt-2">
                        {data.map((d) => (
                          <div
                            key={d.priority}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground"
                          >
                            <span
                              className="size-2 rounded-full shrink-0"
                              style={{ backgroundColor: d.color }}
                            />
                            <span>
                              {PRIORITY_LABELS[d.priority]} ({d.count})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
