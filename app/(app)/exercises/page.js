import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { listExercises } from "@/lib/exercises";
import ExerciseCard from "@/components/ExerciseCard";
import CatalogFilters from "@/components/CatalogFilters";

export const dynamic = "force-dynamic";

export default async function ExercisesPage({ searchParams }) {
  const session = await auth();
  const params = await searchParams;
  const category = params?.category || "all";
  const query = (params?.q || "").toLowerCase();
  const [exercises, categories] = await Promise.all([
    listExercises(session.user.id),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const filtered = exercises.filter((item) => {
    const byCategory = category === "all" || item.categories.includes(category);
    const byQuery = !query || `${item.title} ${item.description}`.toLowerCase().includes(query);
    return byCategory && byQuery;
  });

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-sm text-muted">Каталог</p>
        <h1 className="display text-4xl">Всё, что уже можно делать лёжа.</h1>
      </header>
      <CatalogFilters categories={categories} active={category} query={params?.q || ""} />
      <p className="text-sm text-muted">{filtered.length} упражнений</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>
    </div>
  );
}
