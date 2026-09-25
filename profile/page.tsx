import { AppShell } from "@/components/AppShell";

export default function ProfilePage() {
  return (
    <AppShell
      eyebrow="Profile"
      title="Jordan Hayes"
      description="Basketball content creator • Building brand content for game-day storytelling and social campaigns."
      primaryAction={{ label: "Edit profile", href: "/profile" }}
    >
      <div className="reveal rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40 sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-3xl font-black text-slate-950">
              J
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-orange-300">Basketball creator</p>
              <h2 className="mt-2 text-2xl font-bold text-white">Jordan Hayes</h2>
            </div>
          </div>

          <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400 hover:text-orange-300">
            Edit profile
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Followers", "12.8K"],
            ["Projects", "41"],
            ["Avg. engagement", "7.4%"],
          ].map(([label, value], index) => (
            <div key={label} className="reveal rounded-2xl border border-white/10 bg-slate-950/60 p-5" style={{ animationDelay: `${index * 120}ms` }}>
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
