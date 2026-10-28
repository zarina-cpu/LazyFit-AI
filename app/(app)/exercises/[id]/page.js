import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { serializeExercise } from "@/lib/exercises";
import { CATEGORY_META, todayIso } from "@/lib/constants";
import CompleteButton from "@/components/CompleteButton";
import CommentBox from "@/components/CommentBox";

export const dynamic = "force-dynamic";

export default async function ExercisePage({ params }) {
  const { id } = await params;
  const session = await auth();
  const exerciseRow = await prisma.exercise.findUnique({
    where: { id },
    include: { categories: { include: { category: true } } },
  });
  if (!exerciseRow) notFound();
  const exercise = serializeExercise(exerciseRow);
  const comments = await prisma.comment.findMany({
    where: { userId: session.user.id, contextType: "EXERCISE", contextId: id },
    orderBy: { createdAt: "desc" },
  });
  const log = await prisma.workoutLog.findFirst({
    where: { userId: session.user.id, exerciseId: id, date: todayIso(), done: true },
  });
  const primary = exercise.categories[0] || "Для ленивых";
  const meta = CATEGORY_META[primary] || CATEGORY_META["Для ленивых"];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-4xl border border-line bg-card">
        <div className="flex h-40 items-end px-6 py-5 sm:h-52" style={{ background: meta.color }}>
          <span className="text-7xl">{meta.emoji}</span>
        </div>
        <div className="space-y-4 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            {exercise.categories.map((name) => (
              <span key={name} className="chip rounded-full px-3 py-1 text-xs">
                {name}
              </span>
            ))}
          </div>
          <h1 className="display text-3xl sm:text-5xl">{exercise.title}</h1>
          <p className="max-w-2xl leading-7 text-muted">{exercise.description}</p>
          {exercise.sourceUrl ? (
            <a href={exercise.sourceUrl} target="_blank" rel="noreferrer" className="inline-block text-sm text-sage">
              Исходная ссылка
            </a>
          ) : null}
          <CompleteButton exerciseId={exercise.id} date={todayIso()} initialDone={Boolean(log)} />
        </div>
      </section>
      <CommentBox contextType="EXERCISE" contextId={id} comments={comments} />
    </div>
  );
}
