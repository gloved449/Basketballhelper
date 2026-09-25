import Link from "next/link";
import { AppShell } from "@/components/AppShell";

const tools = [
  { href: "/editor", icon: "🏀", title: "Create Poster", description: "Design standout match-day posters and championship graphics." },
  { href: "/editor", icon: "🎬", title: "Make Highlights", description: "Package big plays into shareable highlight reels." },
  { href: "/editor", icon: "📸", title: "Edit Photo", description: "Enhance portraits, action shots, and game-day visuals." },
  { href: "/editor", icon: "✍️", title: "Write Caption", description: "Generate punchy, on-brand copy for every post." },
  { href: "/editor", icon: "🤖", title: "AI Assistant", description: "Describe your concept and let the studio build it." },
  { href: "/dashboard", icon: "📁", title: "My Projects", description: "Review active drafts, exports, and saved campaign assets." },
];

const stats = [
  { label: "Templates", value: "120+" },
  { label: "Avg. output", value: "3x faster" },
  { label: "Campaigns live", value: "18" },
];

export default function Home() {
  return (
    <AppShell
      eyebrow="Create without limits"
      title="Turn basketball moments into scroll-stopping content."
      description="Build posters, highlight packages, creative captions, and polished social media content from one AI-powered studio."
      primaryAction={{ label: "Start a project", href: "/dashboard" }}
    >
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="reveal rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
          <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
            <span>AI autopilot</span>
            <span className="text-slate-500">•</span>
            <span>Basketball content</span>
          </div>

          <h2 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
            Built for creators, teams, and game-day brands.
          </h2>

          <p className="mt-5 max-w-xl text-lg text-slate-300">
            From draft boards to social recaps, CourtStudio gives your basketball content a faster, sharper, more professional workflow.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/editor" className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-400">
              Launch editor
            </Link>
            <Link href="/templates" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-orange-400 hover:text-orange-300">
              Browse templates
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat, index) => (
            <div key={stat.label} className={`reveal rounded-2xl border border-white/10 bg-slate-900/80 p-5 ${index === 0 ? "card-glow" : ""}`} style={{ animationDelay: `${index * 120}ms` }}>
              <p className="text-xl font-black text-white">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Studio tools</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Everything your next basketball campaign needs</h3>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool, index) => (
            <div key={tool.title} className="reveal" style={{ animationDelay: `${index * 100}ms` }}>
              <ToolCard {...tool} />
            </div>
          ))}
        </div>
      </section>

      <section className="reveal mt-10 rounded-3xl border border-orange-500/20 bg-orange-500/10 p-6 sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-300">AI autopilot</p>
            <h3 className="mt-3 text-2xl font-bold text-white">Not sure where to start?</h3>
            <p className="mt-2 max-w-2xl text-slate-200">
              Describe the mood, color palette, and audience, and the studio can shape the first draft for you.
            </p>
          </div>

          <Link href="/editor" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            Try AI assistant
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function ToolCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-orange-500/60 hover:bg-slate-900"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 text-2xl text-orange-300">{icon}</div>

      <h4 className="mt-5 text-xl font-bold text-white">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>

      <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-300">
        Open tool <span aria-hidden="true">→</span>
      </div>
    </Link>
  );
}
