import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePlan, getLatestPlan } from "@/lib/plan";
import { goalLabel, jsDayToPlanDay, todayIso, WEEKDAYS } from "@/lib/constants";
import { serializeExercise } from "@/lib/exercises";
import CompleteButton from "@/components/CompleteButton";
import ExerciseCard from "@/components/ExerciseCard";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const session = await auth();
  const userId = session.user.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  let plan = await getLatestPlan(userId);
  if (!plan) {
    plan = await generatePlan(userId, user?.targetGoal || "MAINTAIN");
  }

  const dayOfWeek = jsDayToPlanDay();
  const today = plan.days.find((day) => day.dayOfWeek === dayOfWeek);
  const date = todayIso();
  const weekday = WEEKDAYS.find((item) => item.id === dayOfWeek);
  const logs = await prisma.workoutLog.findMany({
    where: { userId, date, done: true },
  });
  const doneIds = new Set(logs.map((item) => item.exerciseId));
  const items = today?.exercises || [];
  const doneCount = items.filter((item) => doneIds.has(item.exerciseId)).length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-4xl bg-[#3f6f5c] px-5 py-6 text-white sm:px-7">
        <div className="blob right-[-20px] top-[-30px] h-32 w-32 bg-white/20" />
        <p className="text-sm text-white/80">
          {weekday?.full} · цель: {goalLabel(user?.targetGoal)}
        </p>
        <h1 className="display mt-1 max-w-lg text-3xl sm:text-5xl">Сегодня можно не геройствовать.</h1>
        <p className="mt-3 max-w-xl text-sm text-white/85">{today?.notes}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-white/15 px-3 py-1 text-sm">
            {doneCount} / {items.length} отмечено
          </span>
          <Link href="/plan" className="rounded-full bg-white px-3 py-1 text-sm text-sage">
            Вся неделя
          </Link>
          <Link href="/chat" className="rounded-full border border-white/30 px-3 py-1 text-sm">
            Спросить ИИ
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="display text-2xl sm:text-3xl">Подходы на сегодня</h2>
          <Link href="/import" className="shrink-0 text-sm text-sage">
            Добавить своё
          </Link>
        </div>
        <div className="grid gap-4">
          {items.map((item) => {
            const exercise = serializeExercise(item.exercise);
            return (
              <article key={item.exerciseId} className="card rounded-3xl p-4 sm:flex sm:items-center sm:gap-5">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">подход {item.order + 1}</p>
                  <h3 className="display text-2xl">{exercise.title}</h3>
                  <p className="mt-1 text-sm text-muted">{exercise.description}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0 sm:flex-col sm:items-stretch">
                  <CompleteButton exerciseId={exercise.id} date={date} initialDone={doneIds.has(exercise.id)} />
                  <Link href={`/exercises/${exercise.id}`} className="rounded-2xl border border-line px-3 py-2 text-center text-sm">
                    Техника
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="display mb-3 text-2xl">Если совсем лень — возьмите одно</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.slice(0, 2).map((item) => (
            <ExerciseCard key={`mini-${item.exerciseId}`} exercise={serializeExercise(item.exercise)} compact />
          ))}
        </div>
      </section>
    </div>
  );
}
