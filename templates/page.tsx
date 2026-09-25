import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const templateCards = [
  { name: "Game Poster", type: "Poster", accent: "🏀" },
  { name: "Player Spotlight", type: "Profile", accent: "⭐" },
  { name: "Team Recap", type: "Social", accent: "📣" },
  { name: "Training Banner", type: "Brand", accent: "🔥" },
  { name: "Highlight Pack", type: "Video", accent: "🎬" },
  { name: "League Promo", type: "Campaign", accent: "🏆" },
];

export default function TemplatesPage() {
  return (
    <AppShell
      eyebrow="Templates"
      title="Ready-made basketball designs"
      description="Jump-start your next social post, poster, or campaign with a branded layout built for hoops creators."
      primaryAction={{ label: "Create from scratch", href: "/editor" }}
    >
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {templateCards.map((template, index) => (
          <div key={template.name} className="reveal rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40" style={{ animationDelay: `${index * 120}ms` }}>
            <div className="flex h-44 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-950 text-5xl shadow-inner shadow-orange-500/10">
              {template.accent}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">{template.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{template.type}</p>
              </div>
              <Link href="/editor" className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400">
                Use
              </Link>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
