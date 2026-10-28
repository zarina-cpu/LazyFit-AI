import { Suspense } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Вход — LazyFit AI",
};

export default function LoginPage() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 py-6 sm:px-6">
      <div className="blob right-[-40px] top-10 h-40 w-40 bg-gold/50" />
      <header className="mx-auto flex max-w-md items-center justify-between">
        <Link href="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto mt-10 w-full max-w-md space-y-5">
        <div>
          <h1 className="display text-4xl">Вход без разминки.</h1>
          <p className="mt-2 text-sm text-muted">Почта, телефон или Google — и сразу к сегодняшней ленивой тренировке.</p>
        </div>
        <Suspense fallback={<div className="card h-64 animate-pulse rounded-4xl" />}>
          <LoginForm googleEnabled={googleEnabled} />
        </Suspense>
      </main>
    </div>
  );
}
