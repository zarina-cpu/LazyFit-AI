"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, Plus, Sofa, UserRound } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

const NAV = [
  { href: "/today", label: "Сегодня", icon: Sofa },
  { href: "/plan", label: "План", icon: CalendarDays },
  { href: "/import", label: "Импорт", icon: Plus, accent: true },
  { href: "/exercises", label: "Каталог", icon: LayoutGrid },
  { href: "/profile", label: "Профиль", icon: UserRound },
];

function isActive(pathname, href) {
  if (href === "/today") return pathname === "/today";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ user, children }) {
  const pathname = usePathname();
  const first = user?.name?.[0]?.toUpperCase() || "L";

  return (
    <div className="min-h-dvh bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-line bg-card px-5 py-6 lg:flex">
        <Logo />
        <nav className="mt-10 flex flex-1 flex-col gap-1.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  active ? "bg-fill text-white" : "text-muted hover:bg-bg-2 hover:text-ink"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
          <Link href="/chat" className="mt-2 rounded-2xl px-3 py-3 text-sm text-muted hover:bg-bg-2 hover:text-ink">
            Чат с тренером
          </Link>
          <Link href="/stats" className="rounded-2xl px-3 py-3 text-sm text-muted hover:bg-bg-2 hover:text-ink">
            Ленивая статистика
          </Link>
        </nav>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-bg px-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sage-2/40 text-sm font-semibold">{first}</span>
            <span className="truncate text-sm">{user?.name || user?.email}</span>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-md lg:hidden">
          <Logo className="scale-95" />
          <div className="flex items-center gap-2">
            <Link href="/chat" className="rounded-2xl border border-line bg-card px-3 py-2 text-xs font-medium">
              ИИ-чат
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="safe-bottom mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 lg:py-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-card/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-1 py-1 text-[11px] ${
                    item.accent
                      ? "text-sage"
                      : active
                        ? "text-sage"
                        : "text-muted"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-2xl ${
                      item.accent ? "bg-fill text-white shadow-lazy" : active ? "bg-sage-2/30" : ""
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
