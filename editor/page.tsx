/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  buildProjectId,
  getTemplateById,
  hydrateProjectsFromServer,
  readStoredProjects,
  templateOptions,
  writeStoredProjects,
  type ProjectTemplate,
  type SavedProject,
} from "@/lib/project-data";

const tools = [
  { name: "Poster" },
  { name: "Highlight" },
  { name: "Photo" },
  { name: "Caption" },
  { name: "AI" },
];

const layers = [
  { name: "Background", id: 1 },
  { name: "Player silhouette", id: 2 },
  { name: "Title text", id: 3 },
  { name: "Scoreboard", id: 4 },
  { name: "Logo", id: 5 },
];

const assets = [
  { label: "Basketball", icon: "🏀" },
  { label: "Crowd", icon: "🎉" },
  { label: "Player", icon: "🧑‍🤝‍🧑" },
  { label: "Text", icon: "T" },
  { label: "Sticker", icon: "✨" },
  { label: "Logo", icon: "◎" },
];

type BuilderItem = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind: "headline" | "score";
  width: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function EditorPageContent() {
  const searchParams = useSearchParams();
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [selectedId, setSelectedId] = useState("headline");
  const [activeTool, setActiveTool] = useState("Poster");
  const [savedText, setSavedText] = useState("Draft not saved");
  const [selectedTemplateId, setSelectedTemplateId] = useState("playoff-poster");
  const [projectDraft, setProjectDraft] = useState<ProjectTemplate>(templateOptions[0]);

  useEffect(() => {
    const syncProjectTemplate = async () => {
      const projects = await hydrateProjectsFromServer();
      const existingProjectId = searchParams.get("project");
      const selectedProject = existingProjectId
        ? projects.find((project) => project.id === existingProjectId)
        : null;

      if (selectedProject) {
        const template = getTemplateById(selectedProject.templateId);
        if (template) {
          setProjectDraft(template);
          setSelectedTemplateId(template.id);
        }
        return;
      }

      const fallback = getTemplateById(selectedTemplateId);
      if (fallback) {
        setProjectDraft(fallback);
      }
    };

    void syncProjectTemplate();

    const existingProjectId = searchParams.get("project");
    const projects = readStoredProjects();
    const selectedProject = existingProjectId
      ? projects.find((project) => project.id === existingProjectId)
      : null;

    if (selectedProject) {
      const template = getTemplateById(selectedProject.templateId);
      if (template) {
        setProjectDraft(template);
        setSelectedTemplateId(template.id);
      }
      return;
    }

    const fallback = getTemplateById(selectedTemplateId);
    if (fallback) {
      setProjectDraft(fallback);
    }
  }, [searchParams, selectedTemplateId]);

  const [items, setItems] = useState<BuilderItem[]>([
    { id: "headline", label: templateOptions[0].headline, x: 100, y: 110, kind: "headline", width: 220 },
    { id: "score", label: templateOptions[0].score, x: 430, y: 265, kind: "score", width: 150 },
  ]);

  useEffect(() => {
    setItems((current) =>
      current.map((item) =>
        item.id === "headline"
          ? { ...item, label: projectDraft.headline }
          : item.id === "score"
            ? { ...item, label: projectDraft.score }
            : item,
      ),
    );
  }, [projectDraft.headline, projectDraft.score]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current || !canvasRef.current) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const { id, offsetX, offsetY } = dragRef.current;
      const nextX = clamp(event.clientX - rect.left - offsetX, 20, rect.width - 120);
      const nextY = clamp(event.clientY - rect.top - offsetY, 20, rect.height - 80);

      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                x: nextX,
                y: nextY,
              }
            : item,
        ),
      );
    };

    const handlePointerUp = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, []);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>, id: string) => {
    const item = items.find((entry) => entry.id === id);
    if (!item || !canvasRef.current) {
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    dragRef.current = {
      id,
      offsetX: event.clientX - rect.left - item.x,
      offsetY: event.clientY - rect.top - item.y,
    };
    setSelectedId(id);
    event.preventDefault();
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplateId(template.id);
    setProjectDraft(template);
  };

  const handleSave = () => {
    const projects: SavedProject[] = readStoredProjects();
    const projectName = projectDraft.name || "New Project";
    const existingProjectId = searchParams.get("project");
    const nextProjectId = existingProjectId ?? buildProjectId();

    const nextProject: SavedProject = {
      id: nextProjectId,
      name: projectName,
      templateId: projectDraft.id,
      type: projectDraft.name,
      updated: "just now",
      status: "Ready",
    };

    const updatedProjects = existingProjectId
      ? projects.map((project) => (project.id === existingProjectId ? nextProject : project))
      : [nextProject, ...projects];

    writeStoredProjects(updatedProjects);
    const params = new URLSearchParams(searchParams.toString());
    params.set("project", nextProjectId);
    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    setSavedText(`Saved: ${projectName}`);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <aside className="panel-slide w-72 border-r border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-8">
            <p className="text-2xl font-bold">🏀 CourtStudio AI</p>
          </div>

          <nav className="space-y-2">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Editor", href: "/editor", active: true },
              { label: "Templates", href: "/templates" },
              { label: "Profile", href: "/profile" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  item.active
                    ? "bg-orange-500 text-black"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="tool-panel mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">AI prompt</p>
            <p className="mt-3 text-sm text-zinc-300">
              Create a bold poster for the championship game using orange and black colors.
            </p>
          </div>

          <div className="tool-panel mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Layers</p>
            <div className="mt-3 space-y-2">
              {layers.map((layer, index) => (
                <div
                  key={layer.name}
                  className={`flex items-center justify-between rounded-lg px-2 py-2 text-sm ${
                    index === 2 ? "bg-zinc-800 text-white" : "text-zinc-300"
                  }`}
                >
                  <span>{layer.name}</span>
                  <span className="text-zinc-500">{layer.id}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="flex-1 p-4 lg:p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-500">Studio</p>
              <h1 className="mt-2 text-3xl font-bold">{projectDraft.name}</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                "Undo",
                "Redo",
                "Share",
                "Export",
              ].map((action) => (
                <button
                  key={action}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    action === "Export"
                      ? "bg-orange-500 text-black"
                      : "border border-zinc-700 bg-zinc-900 text-zinc-200 hover:border-zinc-500"
                  }`}
                >
                  {action}
                </button>
              ))}
              <button
                onClick={handleSave}
                className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Save
              </button>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)_300px]">
            <aside className="tool-panel rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Project tools</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => setActiveTool(tool.name)}
                      className={`tool-button rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                        activeTool === tool.name
                          ? "bg-orange-500 text-black shadow-lg shadow-orange-500/30"
                          : "border border-zinc-700 bg-zinc-950 text-zinc-300 hover:border-zinc-500 hover:text-white"
                      }`}
                    >
                      {tool.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="tool-panel">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Templates</p>
                  <div className="mt-3 space-y-2">
                    {templateOptions.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                          selectedTemplateId === template.id
                            ? "border-orange-500 bg-orange-500/10 text-orange-200"
                            : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600"
                        }`}
                      >
                        <span>{template.name}</span>
                        <span className="text-zinc-500">→</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="tool-panel">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Assets</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {assets.map((asset) => (
                      <button
                        key={asset.label}
                        className="rounded-xl border border-zinc-800 bg-zinc-950 p-2 text-center text-xs transition hover:border-zinc-600 hover:bg-zinc-800"
                      >
                        <div className="text-xl">{asset.icon}</div>
                        <div className="mt-1 text-[10px] text-zinc-300">{asset.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <div className="tool-panel rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Auto layout",
                    "16:9",
                    "Brand kit",
                    "Smart crop",
                    "Generate variants",
                  ].map((action) => (
                    <button
                      key={action}
                      className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-zinc-500"
                    >
                      {action}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-orange-400">1280 × 720</div>
              </div>

              <div
                ref={canvasRef}
                className="relative min-h-[460px] overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(135deg,#0a0f1d,#111827_40%,#1f2937)] bg-[size:28px_28px,28px_28px,100%_100%] shadow-2xl shadow-orange-500/10"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.35),transparent_40%)]" />

                <div className="absolute left-8 top-8 rounded-full border border-zinc-700 bg-zinc-900/75 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-200">
                  {projectDraft.kicker}
                </div>

                <div className="relative h-full w-full">
                  {items.map((item) => {
                    const isSelected = item.id === selectedId;

                    return (
                      <div
                        key={item.id}
                        onPointerDown={(event) => startDrag(event, item.id)}
                        style={{
                          left: `${item.x}px`,
                          top: `${item.y}px`,
                          width: `${item.width}px`,
                        }}
                        className={`absolute cursor-grab active:cursor-grabbing ${
                          isSelected ? "ring-2 ring-orange-400 ring-offset-2 ring-offset-zinc-900" : ""
                        }`}
                      >
                        {item.kind === "headline" ? (
                          <div className="rounded-xl border border-orange-500/40 bg-black/25 px-5 py-3 text-center backdrop-blur-sm">
                            <p className="text-3xl font-black tracking-[0.08em] text-white md:text-5xl">
                              {item.label}
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-orange-500/40 bg-black/40 px-4 py-3 text-right shadow-lg shadow-orange-500/10 backdrop-blur-sm">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Final</p>
                            <p className="text-lg font-bold text-white md:text-3xl">{item.label}</p>
                          </div>
                        )}

                        <div className="absolute -right-2 -top-2 h-3 w-3 rounded-full border border-white bg-orange-400" />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Layers", value: "05" },
                  { label: "Variants", value: "12" },
                  { label: "AI score", value: "92%" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-center">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{metric.label}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{metric.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="tool-panel space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Text</p>
                <div className="mt-3 space-y-3">
                  <input
                    value={projectDraft.headline}
                    onChange={(event) => setProjectDraft((current) => ({ ...current, headline: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                  <input
                    value={projectDraft.subtitle}
                    onChange={(event) => setProjectDraft((current) => ({ ...current, subtitle: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Inspector</p>
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Selected</div>
                    <div className="mt-1 text-sm font-medium text-white">{selectedId === "headline" ? "Title text" : "Scoreboard"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Font
                      <div className="mt-1 text-xs normal-case tracking-normal text-white">Bebas</div>
                    </div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Size
                      <div className="mt-1 text-xs normal-case tracking-normal text-white">72</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Color
                      <div className="mt-1 flex items-center gap-2 text-xs tracking-normal text-white">
                        <span className="h-3.5 w-3.5 rounded-full bg-orange-500" />
                        Orange
                      </div>
                    </div>
                    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                      Align
                      <div className="mt-1 text-xs normal-case tracking-normal text-white">Center</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Image upload</p>
                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-4 text-center text-sm text-zinc-300 hover:border-orange-500">
                  <span className="text-2xl">📷</span>
                  <span className="mt-2">Upload photo</span>
                  <input type="file" className="hidden" />
                </label>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">AI prompt</p>
                <textarea
                  onChange={(event) => setSavedText(event.target.value ? `Prompt updated` : "Draft not saved")}
                  defaultValue="Design a bold orange and black poster for the playoff final. Include player silhouettes, scoreboard, and a dramatic headline."
                  className="mt-3 min-h-[100px] w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-sm text-zinc-200 outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Style</p>
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {projectDraft.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="h-9 rounded-lg border border-zinc-700 transition hover:scale-105"
                      style={{ backgroundColor: color }}
                      aria-label={`Use ${color} accent`}
                      onClick={() => setSavedText(`Accent selected: ${color}`)}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs text-zinc-300">
                {savedText}
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white">Loading editor...</div>}>
      <EditorPageContent />
    </Suspense>
  );
}
