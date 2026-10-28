import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const session = await auth();
  const logs = await prisma.workoutLog.findMany({
    where: { userId: session.user.id, done: true },
    include: { exercise: true },
    orderBy: { date: "asc" },
  });

  const byDate = {};
  for (const log of logs) {
    byDate[log.date] = (byDate[log.date] || 0) + 1;
  }
  const days = Object.keys(byDate).sort().slice(-7);
  const max = Math.max(1, ...days.map((day) => byDate[day]));
  const total = logs.length;
  const uniqueDays = new Set(logs.map((item) => item.date)).size;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-muted">Ленивая статистика</p>
        <h1 className="display text-4xl">Без сложных графиков. Только факты, что вы не совсем лежали.</h1>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <article className="card rounded-3xl p-5">
          <p className="text-sm text-muted">Подходов всего</p>
          <p className="display text-4xl">{total}</p>
        </article>
        <article className="card rounded-3xl p-5">
          <p className="text-sm text-muted">Дней с движением</p>
          <p className="display text-4xl">{uniqueDays}</p>
        </article>
        <article className="card rounded-3xl p-5">
          <p className="text-sm text-muted">Последняя отметка</p>
          <p className="display text-2xl">{days.at(-1) || "ещё впереди"}</p>
        </article>
      </section>

      <section className="card rounded-4xl p-5 sm:p-7">
        <h2 className="display text-2xl">Последние дни</h2>
        {days.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Пока пусто. Отметьте подход на странице{" "}
            <Link href="/today" className="text-sage">
              Сегодня
            </Link>
            .
          </p>
        ) : (
          <div className="mt-6 flex h-40 items-end gap-2 sm:gap-3">
            {days.map((day) => (
              <div key={day} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-2xl bg-sage"
                  style={{ height: `${Math.max(12, (byDate[day] / max) * 100)}%` }}
                />
                <span className="text-[10px] text-muted">{day.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
