import Link from "next/link";
import { auth } from "@/auth";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const FEATURES = [
  {
    title: "Медиа-сканер",
    text: "Ссылка из TikTok, YouTube или просто описание — ИИ собирает карточку упражнения и кладёт в ваш каталог.",
  },
  {
    title: "План без расписания в Excel",
    text: "Каждую неделю миксуем упражнения, чтобы не надоело. Цель можно сменить в любой момент.",
  },
  {
    title: "Чат вместо зала",
    text: "Напишите «руки, но болят запястья» — получите мягкие альтернативы и добавите их в план.",
  },
];

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="blob left-[-80px] top-[-40px] h-56 w-56 bg-sage-2" />
      <div className="blob bottom-20 right-[-60px] h-64 w-64 bg-terra/40" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Logo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={session ? "/today" : "/login"}
            className="rounded-2xl bg-fill px-4 py-2.5 text-sm font-medium text-white"
          >
            {session ? "К тренировке" : "Войти"}
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-12">
        <section className="space-y-6">
          <p className="chip inline-flex rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]">для тех, кому лень, но хочется</p>
          <h1 className="display max-w-xl text-4xl leading-[1.05] sm:text-6xl">
            Тренировки, которые не требуют встать с дивана сразу.
          </h1>
          <p className="max-w-lg text-base text-muted sm:text-lg">
            LazyFit AI превращает ролики, гифки и фразы вроде «хочу пресс, но сегодня сериал» в понятный план на неделю.
            Никакого героического кроссфита — только то, что вы сами одобрили.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="rounded-2xl bg-fill px-5 py-3 text-center font-medium text-white">
              Начать лениво
            </Link>
            <Link href="/login" className="rounded-2xl border border-line bg-card px-5 py-3 text-center">
              Демо-аккаунт уже готов
            </Link>
          </div>
          <dl className="grid grid-cols-3 gap-3 pt-4 text-sm">
            <div className="rounded-3xl border border-line bg-card p-3">
              <dt className="text-muted">Импорт</dt>
              <dd className="display text-2xl">ссылка → карточка</dd>
            </div>
            <div className="rounded-3xl border border-line bg-card p-3">
              <dt className="text-muted">План</dt>
              <dd className="display text-2xl">7 дней микса</dd>
            </div>
            <div className="rounded-3xl border border-line bg-card p-3">
              <dt className="text-muted">Цель</dt>
              <dd className="display text-2xl">худеть / держать / расти</dd>
            </div>
          </dl>
        </section>

        <section className="card relative rounded-4xl p-5 sm:p-7">
          <p className="text-sm text-muted">Сегодня, не вставая</p>
          <h2 className="display mt-1 text-3xl">Глютеальный мостик</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Лёжа на диване, стопы на полу. Таз вверх, пауза 2 секунды. Сериал можно не ставить на паузу.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Для ягодиц", "Для ног", "Для ленивых"].map((tag) => (
              <span key={tag} className="chip rounded-full px-3 py-1 text-xs">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-bg-2">
            <div className="h-full w-2/3 rounded-full bg-sage" />
          </div>
          <p className="mt-2 text-xs text-muted">2 из 4 подходов. Остальное — когда закончится серия.</p>
        </section>
      </main>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-4 px-4 pb-24 sm:grid-cols-3 sm:px-6">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="card rounded-3xl p-5">
            <h3 className="display text-2xl">{feature.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{feature.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
