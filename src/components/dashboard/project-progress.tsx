"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FolderKanban } from "lucide-react";
import { motion } from "framer-motion";

interface ProjectProgressItem {
  id: string;
  name: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
}

interface ProjectProgressProps {
  projects: ProjectProgressItem[];
}

export function ProjectProgress({ projects }: ProjectProgressProps) {
  const t = useTranslations("dashboard");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      <Card className="transition-shadow hover:shadow-md h-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderKanban className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">
              {t("projectProgress")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground">
              <FolderKanban className="size-10 opacity-40" />
              <p className="text-sm">{t("noData")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => {
                const percent =
                  project.totalTasks > 0
                    ? Math.round(
                        (project.completedTasks / project.totalTasks) * 100
                      )
                    : 0;

                return (
                  <div key={project.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-sm font-medium truncate">
                          {project.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {project.completedTasks}/{project.totalTasks}
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={percent}
                        className="h-2"
                        style={
                          {
                            "--progress-color": project.color,
                          } as React.CSSProperties
                        }
                      />
                      {/* Overlay the indicator color with project color */}
                      <div
                        className="absolute top-0 left-0 h-2 rounded-full transition-all"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
