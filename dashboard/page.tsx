"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  defaultProjects,
  deleteProjectById,
  duplicateProject,
  hydrateProjectsFromServer,
  readStoredProjects,
  updateProjectById,
  type SavedProject,
} from "@/lib/project-data";

const stats = [
  { label: "Projects", value: "24" },
  { label: "Videos", value: "8" },
  { label: "Drafts", value: "6" },
  { label: "Storage", value: "1.2 GB" },
];

export default function DashboardPage() {
  const [projects, setProjects] = useState<SavedProject[]>(defaultProjects);

  const refreshProjects = () => {
    setProjects(readStoredProjects());
  };

  useEffect(() => {
    void hydrateProjectsFromServer().then((projectsFromServer) => {
      setProjects(projectsFromServer);
    });
    refreshProjects();

    const handleStorageChange = () => refreshProjects();
    const handleCustomUpdate = () => refreshProjects();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("courtstudio-projects-updated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("courtstudio-projects-updated", handleCustomUpdate);
    };
  }, []);

  const handleRenameProject = (projectId: string, currentName: string) => {
    const nextName = window.prompt("Rename project", currentName)?.trim();
    if (!nextName) {
      return;
    }

    updateProjectById(projectId, { name: nextName });
    refreshProjects();
  };

  const handleDuplicateProject = (project: SavedProject) => {
    duplicateProject(project);
    refreshProjects();
  };

  const handleDeleteProject = (projectId: string) => {
    const confirmed = window.confirm("Delete this project permanently?");
    if (!confirmed) {
      return;
    }

    deleteProjectById(projectId);
    refreshProjects();
  };

  const projectStats = [
    { label: "Projects", value: String(projects.length) },
    { label: "Videos", value: String(Math.max(1, Math.round(projects.length * 1.7))) },
    { label: "Drafts", value: String(projects.filter((project) => project.status === "Draft").length) },
    { label: "Storage", value: `${Math.max(0.6, projects.length * 0.4).toFixed(1)} GB` },
  ];

  return (
    <AppShell
      eyebrow="Dashboard"
      title="My Studio"
      description="Track your latest assets, active campaigns, and creative momentum across every project."
      primaryAction={{ label: "+ New project", href: "/editor" }}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {projectStats.map((stat, index) => (
          <div key={stat.label} className="reveal rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40" style={{ animationDelay: `${index * 120}ms` }}>
            <p className="text-sm text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="reveal mt-10 rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-[0_0_40px_rgba(15,23,42,0.8)] sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Recent work</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Projects</h2>
          </div>

          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-orange-400 hover:text-orange-300">
            View all
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/60 p-8 text-center">
            <p className="text-lg font-semibold text-white">No projects yet</p>
            <p className="mt-2 text-sm text-slate-400">Create your first basketball design and it will appear here.</p>
            <Link href="/editor" className="mt-4 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400">
              Start a project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const statusTone =
                project.status === "Ready"
                  ? "emerald"
                  : project.status === "Editing"
                    ? "amber"
                    : "slate";

              return (
                <div
                  key={project.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/70 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">
                      {project.type} • Updated {project.updated}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                        statusTone === "emerald"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : statusTone === "amber"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            : "border-slate-500/30 bg-slate-500/10 text-slate-300"
                      }`}
                    >
                      {project.status}
                    </span>
                    <Link href={`/editor?project=${project.id}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
                      Open
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRenameProject(project.id, project.name)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-orange-400 hover:text-orange-300"
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateProject(project)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-orange-400 hover:text-orange-300"
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project.id)}
                      className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-200 transition hover:border-red-400 hover:text-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
