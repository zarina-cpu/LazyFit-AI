import Link from "next/link";
import { CATEGORY_META } from "@/lib/constants";

export default function ExerciseCard({ exercise, compact = false }) {
  const primary = exercise.categories?.[0] || "Для ленивых";
  const meta = CATEGORY_META[primary] || CATEGORY_META["Для ленивых"];

  return (
    <Link
      href={`/exercises/${exercise.id}`}
      className="card group block overflow-hidden rounded-3xl transition hover:-translate-y-0.5"
    >
      <div className="relative h-28 overflow-hidden sm:h-32" style={{ background: meta.color }}>
        <span className="absolute -right-3 -top-4 text-7xl opacity-40">{meta.emoji}</span>
        <span className="absolute bottom-3 left-3 rounded-full bg-black/20 px-2.5 py-1 text-xs text-white">
          {exercise.isCustom ? "Ваше" : "Библиотека"}
        </span>
      </div>
      <div className={`space-y-2 p-4 ${compact ? "p-3" : ""}`}>
        <h3 className="display text-lg leading-tight">{exercise.title}</h3>
        {!compact ? (
          <p className="line-clamp-2 text-sm text-muted">{exercise.description}</p>
        ) : null}
        <div className="flex flex-wrap gap-1.5">
          {(exercise.categories || []).slice(0, 3).map((name) => (
            <span key={name} className="chip rounded-full px-2 py-0.5 text-[11px]">
              {name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
