"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { getProjects } from "@/actions/project-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid } from "lucide-react";

type ProjectItem = {
  id: string;
  name: string;
  color: string;
};

export default function BoardPage() {
  const t = useTranslations("board");
  const tProject = useTranslations("project");
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getProjects();
      setProjects(
        data.map((p) => ({ id: p.id, name: p.name, color: p.color }))
      );
    });
  }, []);

  function handleProjectChange(projectId: string) {
    router.push(`board/${projectId}`);
  }

  if (isPending && projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <LayoutGrid className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{tProject("noProjects")}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {tProject("createFirst")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <Select onValueChange={handleProjectChange}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder={t("selectProject")} />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  {project.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="flex flex-col items-center gap-3 text-center">
          <LayoutGrid className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{t("selectProject")}</p>
        </div>
      </div>
    </div>
  );
}
