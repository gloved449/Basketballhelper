export type ProjectTemplate = {
  id: string;
  name: string;
  headline: string;
  subtitle: string;
  score: string;
  kicker: string;
  colors: string[];
};

export type SavedProject = {
  id: string;
  name: string;
  templateId: string;
  type: string;
  updated: string;
  status: "Ready" | "Editing" | "Draft";
};

export const templateOptions: ProjectTemplate[] = [
  {
    id: "playoff-poster",
    name: "Game Poster",
    headline: "CHAMPIONS",
    subtitle: "Battle for the city",
    score: "FINAL 87 - 81",
    kicker: "PLAYOFFS",
    colors: ["#f97316", "#facc15", "#f8fafc", "#111827", "#ef4444", "#22c55e"],
  },
  {
    id: "spotlight",
    name: "Player Spotlight",
    headline: "STAR POWER",
    subtitle: "Night shift takeover",
    score: "32 PTS • 8 REB",
    kicker: "FEATURED PLAYER",
    colors: ["#22c55e", "#f8fafc", "#0f172a", "#f97316", "#a78bfa", "#facc15"],
  },
  {
    id: "recap-card",
    name: "Recap Card",
    headline: "WEEKLY RECAP",
    subtitle: "Momentum keeps building",
    score: "5-1 RUN",
    kicker: "TEAM UPDATE",
    colors: ["#f97316", "#f8fafc", "#0f172a", "#60a5fa", "#22c55e", "#facc15"],
  },
];

export const defaultProjects: SavedProject[] = [
  {
    id: "project-1",
    name: "Summer League Poster",
    templateId: "playoff-poster",
    type: "Poster",
    updated: "2 hours ago",
    status: "Ready",
  },
  {
    id: "project-2",
    name: "Game Day Highlights",
    templateId: "spotlight",
    type: "Highlight Reel",
    updated: "1 day ago",
    status: "Editing",
  },
  {
    id: "project-3",
    name: "Training Camp Recap",
    templateId: "recap-card",
    type: "Social Post",
    updated: "3 days ago",
    status: "Draft",
  },
];

export const storageKey = "courtstudio-projects";

export async function hydrateProjectsFromServer() {
  if (typeof window === "undefined") {
    return defaultProjects;
  }

  try {
    const response = await fetch("/api/projects", { cache: "no-store" });
    if (!response.ok) {
      return readStoredProjects();
    }

    const data = (await response.json()) as SavedProject[];
    if (!Array.isArray(data) || data.length === 0) {
      return readStoredProjects();
    }

    window.localStorage.setItem(storageKey, JSON.stringify(data));
    return data;
  } catch {
    return readStoredProjects();
  }
}

export function getTemplateById(templateId: string | null | undefined): ProjectTemplate | undefined {
  return templateOptions.find((template) => template.id === templateId) ?? templateOptions[0];
}

export function readStoredProjects(): SavedProject[] {
  if (typeof window === "undefined") {
    return defaultProjects;
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);
    if (!storedValue) {
      return defaultProjects;
    }

    const parsed = JSON.parse(storedValue) as SavedProject[];
    if (!Array.isArray(parsed)) {
      return defaultProjects;
    }

    return parsed.length > 0 ? parsed : defaultProjects;
  } catch {
    return defaultProjects;
  }
}

async function persistProjectsToServer(projects: SavedProject[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projects),
      cache: "no-store",
    });
  } catch {
    // fall back to browser-only persistence if the backend is unavailable
  }
}

export function writeStoredProjects(projects: SavedProject[]) {
  if (typeof window === "undefined") {
    return;
  }

  const payload = JSON.stringify(projects);
  window.localStorage.setItem(storageKey, payload);
  void persistProjectsToServer(projects);

  if (typeof StorageEvent !== "undefined") {
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey, newValue: payload }));
  }

  window.dispatchEvent(new CustomEvent("courtstudio-projects-updated", { detail: projects }));
}

export function buildProjectId() {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function updateProjectById(projectId: string, updates: Partial<SavedProject>) {
  const projects = readStoredProjects();
  const nextProjects = projects.map((project) =>
    project.id === projectId ? { ...project, ...updates, updated: "just now" } : project,
  );

  writeStoredProjects(nextProjects);
  return nextProjects;
}

export function deleteProjectById(projectId: string) {
  const projects = readStoredProjects();
  const nextProjects = projects.filter((project) => project.id !== projectId);
  writeStoredProjects(nextProjects);
  return nextProjects;
}

export function duplicateProject(project: SavedProject) {
  const nextProject: SavedProject = {
    ...project,
    id: buildProjectId(),
    name: `${project.name} copy`,
    updated: "just now",
    status: "Draft",
  };

  const projects = readStoredProjects();
  const nextProjects = [nextProject, ...projects];
  writeStoredProjects(nextProjects);
  return nextProjects;
}
