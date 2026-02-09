import { getProjects } from "@/actions/project-actions";
import { ProjectsClient } from "./projects-client";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return <ProjectsClient initialProjects={projects} />;
}
