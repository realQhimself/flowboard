import { getProject } from "@/actions/project-actions";
import { getLabels } from "@/actions/label-actions";
import { notFound } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export default async function ProjectBoardPage({
  params,
}: {
  params: Promise<{ projectId: string; locale: string }>;
}) {
  const { projectId } = await params;

  const [project, labels] = await Promise.all([
    getProject(projectId),
    getLabels(),
  ]);

  if (!project) {
    notFound();
  }

  return <KanbanBoard project={project} labels={labels} />;
}
