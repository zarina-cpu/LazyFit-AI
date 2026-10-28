import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { generatePlan, getLatestPlan } from "@/lib/plan";
import { WEEKDAYS } from "@/lib/constants";
import { serializeExercise } from "@/lib/exercises";
import GeneratePlanButton from "@/components/GeneratePlanButton";
import CommentBox from "@/components/CommentBox";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  let plan = await getLatestPlan(session.user.id);
  if (!plan) plan = await generatePlan(session.user.id, user?.targetGoal || "MAINTAIN");
  const comments = await prisma.comment.findMany({
    where: { userId: session.user.id, contextType: "PLAN_DAY" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">Неделя</p>
          <h1 className="display text-4xl">План, который сам себя перемешивает.</h1>
        </div>
        <GeneratePlanButton />
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {plan.days.map((day) => {
          const weekday = WEEKDAYS.find((item) => item.id === day.dayOfWeek);
          return (
            <article key={day.id} className="card rounded-3xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">{weekday?.short}</p>
                  <h2 className="display text-2xl">{weekday?.full}</h2>
                </div>
                <span className="chip rounded-full px-2 py-1 text-[11px]">{day.exercises.length} шт.</span>
              </div>
              <p className="mt-2 text-sm text-muted">{day.notes}</p>
              <ul className="mt-4 space-y-2">
                {day.exercises.map((item) => {
                  const exercise = serializeExercise(item.exercise);
                  return (
                    <li key={item.exerciseId}>
                      <Link href={`/exercises/${exercise.id}`} className="block rounded-2xl bg-bg px-3 py-2 text-sm hover:bg-bg-2">
                        {exercise.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>

      <CommentBox
        contextType="PLAN_DAY"
        contextId={plan.days[0]?.id || plan.id}
        comments={comments.filter((item) => item.contextId === plan.days[0]?.id)}
      />
    </div>
  );
}
