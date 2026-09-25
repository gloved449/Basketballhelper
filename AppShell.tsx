"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/editor", label: "Editor" },
  { href: "/templates", label: "Templates" },
  { href: "/profile", label: "Profile" },
];

type AppShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    href: string;
  };
  children: ReactNode;
};

export function AppShell({
  eyebrow,
  title,
  description,
  primaryAction,
  children,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050816] text-slate-50">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050816]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-black text-slate-950 shadow-lg shadow-orange-500/30">
                🏀
              </div>
              <div>
                <p className="text-lg font-bold tracking-tight">CourtStudio AI</p>
              </div>
            </Link>

            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-orange-400 sm:hidden"
              >
                {primaryAction.label}
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition hover:border-orange-400 hover:text-orange-300 sm:hidden"
              >
                New
              </Link>
            )}
          </div>

          <nav className="flex flex-wrap items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1 sm:justify-center lg:max-w-fit">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3 py-2 text-xs font-medium transition sm:text-sm ${
                    isActive
                      ? "bg-orange-500 text-slate-950 shadow-lg shadow-orange-500/30"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:block">
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
              >
                {primaryAction.label}
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-orange-400 hover:text-orange-300"
              >
                New project
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {(eyebrow || title || description) && (
          <section className="reveal mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-[0_0_50px_rgba(249,115,22,0.08)] sm:p-8">
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-400">{eyebrow}</p>}
            <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">{title}</h1>
                {description && <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">{description}</p>}
              </div>

              {primaryAction && (
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-orange-400 sm:px-5 sm:py-3"
                >
                  {primaryAction.label}
                </Link>
              )}
            </div>
          </section>
        )}

        {children}
      </main>
    </div>
  );
}
