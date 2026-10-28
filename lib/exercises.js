import { prisma } from "./prisma";

export function serializeExercise(exercise) {
  return {
    id: exercise.id,
    title: exercise.title,
    description: exercise.description,
    mediaUrl: exercise.mediaUrl,
    mediaType: exercise.mediaType,
    sourceUrl: exercise.sourceUrl,
    isCustom: exercise.isCustom,
    userId: exercise.userId,
    categories: (exercise.categories || []).map((link) => link.category?.name).filter(Boolean),
  };
}

export async function listExercises(userId) {
  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [{ userId: null }, { userId }, { isCustom: false }],
    },
    include: {
      categories: { include: { category: true } },
    },
    orderBy: { title: "asc" },
  });

  const unique = [];
  const seen = new Set();
  for (const item of exercises) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(serializeExercise(item));
  }
  return unique;
}

export async function saveParsedExercise(userId, parsed, extra = {}) {
  const names = [...new Set([...(parsed.categories || []), "Для ленивых"])];
  const categories = [];
  for (const name of names) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    categories.push(category);
  }

  const exercise = await prisma.exercise.create({
    data: {
      title: parsed.title,
      description: parsed.description,
      mediaType: parsed.mediaType || extra.mediaType || "LINK",
      mediaUrl: extra.mediaUrl || null,
      sourceUrl: extra.sourceUrl || null,
      isCustom: true,
      userId,
      categories: {
        create: categories.map((category) => ({ categoryId: category.id })),
      },
    },
    include: { categories: { include: { category: true } } },
  });

  return serializeExercise(exercise);
}
