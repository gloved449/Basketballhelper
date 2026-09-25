/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { SavedProject } from "@/lib/project-data";

const fallbackStorageKey = "courtstudio-projects";

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

function mapSupabaseRow(row: Record<string, unknown>): SavedProject {
  return normalizeProject({
    id: String(row.id ?? row.project_id ?? "project-fallback"),
    name: String(row.name ?? "Untitled project"),
    templateId: String(row.template_id ?? row.templateId ?? "playoff-poster"),
    type: String(row.type ?? "Poster"),
    updated: String(row.updated ?? row.updated_at ?? "just now"),
    status: (row.status as SavedProject["status"]) ?? "Draft",
  });
}

export async function GET() {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (!error && Array.isArray(data)) {
      return NextResponse.json(data.map((row) => mapSupabaseRow(row as Record<string, unknown>)));
    }
  }

  return NextResponse.json(readFallbackProjects());
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const projects = Array.isArray(payload) ? payload.map((project) => normalizeProject(project as Partial<SavedProject>)) : [];

    const supabase = getSupabaseServerClient();
    if (supabase) {
      const sanitized = projects.map((project) => ({
        id: project.id,
        name: project.name,
        template_id: project.templateId,
        type: project.type,
        updated: project.updated,
        status: project.status,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("projects").upsert(sanitized, { onConflict: "id" });
      if (!error) {
        return NextResponse.json({ ok: true, projects });
      }
    }

    writeFallbackProjects(projects);
    return NextResponse.json({ ok: true, projects });
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid project payload" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { error } = await supabase.from("projects").delete().neq("id", "");
    if (!error) {
      return NextResponse.json({ ok: true });
    }
  }

  writeFallbackProjects([]);
  return NextResponse.json({ ok: true });
}
