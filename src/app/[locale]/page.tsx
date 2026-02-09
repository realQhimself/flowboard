import { getTranslations } from "next-intl/server";
import {
  getDashboardStats,
  getCompletionHistory,
  getPriorityBreakdown,
  getUpcomingDeadlines,
  getProjectProgress,
} from "@/actions/dashboard-actions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { CompletionChart } from "@/components/dashboard/completion-chart";
import { PriorityChart } from "@/components/dashboard/priority-chart";
import { UpcomingDeadlines } from "@/components/dashboard/upcoming-deadlines";
import { ProjectProgress } from "@/components/dashboard/project-progress";

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  const [stats, completionHistory, priorityBreakdown, deadlines, projectProgress] =
    await Promise.all([
      getDashboardStats(),
      getCompletionHistory(30),
      getPriorityBreakdown(),
      getUpcomingDeadlines(8),
      getProjectProgress(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      {/* Row 1: Stats cards */}
      <StatsCards stats={stats} />

      {/* Row 2: Completion trend + Priority breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <CompletionChart data={completionHistory} />
        </div>
        <div className="lg:col-span-1">
          <PriorityChart data={priorityBreakdown} />
        </div>
      </div>

      {/* Row 3: Upcoming deadlines + Project progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UpcomingDeadlines tasks={deadlines.tasks} hasMore={deadlines.hasMore} />
        <ProjectProgress projects={projectProgress} />
      </div>
    </div>
  );
}
