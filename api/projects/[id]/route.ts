import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { SavedProject } from "@/lib/project-data";

function normalizeProject(project: Partial<SavedProject>): SavedProject {
  return {
    id: project.id ?? "project-fallback",
    name: project.name ?? "Untitled project",
    templateId: project.templateId ?? "playoff-poster",
    type: project.type ?? "Poster",
    updated: project.updated ?? "just now",
    status: (project.status ?? "Draft") as SavedProject["status"],
  };
}

function readFallbackProjects(): SavedProject[] {
  const stored = process.env.COURTSTUDIO_PROJECTS ?? "";
  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => normalizeProject(item as Partial<SavedProject>));
  } catch {
    return [];
  }
}

function writeFallbackProjects(projects: SavedProject[]) {
  process.env.COURTSTUDIO_PROJECTS = JSON.stringify(projects);
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
    if (!error && data) {
      return NextResponse.json(
        normalizeProject({
          id: String(data.id ?? id),
          name: String(data.name ?? "Untitled project"),
          templateId: String(data.template_id ?? data.templateId ?? "playoff-poster"),
          type: String(data.type ?? "Poster"),
          updated: String(data.updated ?? data.updated_at ?? "just now"),
          status: (data.status as SavedProject["status"]) ?? "Draft",
        }),
      );
    }
  }

  const project = readFallbackProjects().find((item) => item.id === id);
  return NextResponse.json(project ?? null);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const payload = (await request.json()) as Partial<SavedProject>;
    const nextProject = normalizeProject({ ...payload, id });

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.from("projects").upsert(
        {
          id: nextProject.id,
          name: nextProject.name,
          template_id: nextProject.templateId,
          type: nextProject.type,
          updated: nextProject.updated,
          status: nextProject.status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (!error) {
        return NextResponse.json(nextProject);
      }
    }

    const projects = readFallbackProjects();
    const existingIndex = projects.findIndex((item) => item.id === id);
    const updated = [...projects];

    if (existingIndex >= 0) {
      updated[existingIndex] = nextProject;
    } else {
      updated.unshift(nextProject);
    }

    writeFallbackProjects(updated);
    return NextResponse.json(nextProject);
  } catch {
    return NextResponse.json({ error: "Invalid project payload" }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      return NextResponse.json({ ok: true, deleted: id });
    }
  }

  const projects = readFallbackProjects().filter((item) => item.id !== id);
  writeFallbackProjects(projects);
  return NextResponse.json({ ok: true, deleted: id });
}
