import { getTasks } from "@/actions/task-actions";
import { getProjects } from "@/actions/project-actions";
import { getLabels } from "@/actions/label-actions";
import { TodosClient } from "./todos-client";

export default async function TodosPage() {
  const [tasks, projects, labels] = await Promise.all([
    getTasks(),
    getProjects(),
    getLabels(),
  ]);

  return (
    <TodosClient
      initialTasks={tasks}
      projects={projects}
      labels={labels}
    />
  );
}
