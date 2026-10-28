import { prisma } from "./prisma";

function shuffle(list, seed) {
  const copy = [...list];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i -= 1) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function weekSeed() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const week = Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000));
  return now.getFullYear() * 100 + week;
}

const DAY_NOTES = {
  LOSE_WEIGHT: [
    "Лёгкий день: сериал не ставим на паузу",
    "Пульс чуть выше, героизма ноль",
    "Диванный кардио-вайб",
    "Коротко, но живо",
    "День «просто встать с дивана»",
    "Прогулочный темп, можно зевать",
    "Восстановление: шея, лицо, дыхание",
  ],
  GAIN_MUSCLE: [
    "Медленные повторы — сила без суеты",
    "Упор на бёдра и ягодицы",
    "Руки и спина, можно с бутылками воды",
    "Кор держим, лицо не хмурим",
    "Силовой, но ленивый",
    "Повтор в верхней точке на 2 секунды",
    "Мягкий день: мобильность и лицо",
  ],
  MAINTAIN: [
    "День без повода для отговорок",
    "Смешанный сет: тело не заскучает",
    "Лёгкая сборка из любимых движений",
    "Баланс: спина, ноги, дыхание",
    "Короткий ритуал перед сериалом",
    "Свободный день — микс всего",
    "Воскресенье: лицо, шея, ничего героического",
  ],
};

export async function generatePlan(userId, goal = "MAINTAIN") {
  const exercises = await prisma.exercise.findMany({
    where: {
      OR: [{ userId: null }, { userId }, { isCustom: false }],
    },
    include: {
      categories: { include: { category: true } },
    },
  });

  if (exercises.length === 0) {
    throw new Error("В каталоге пока нет упражнений");
  }

  const unique = [];
  const seen = new Set();
  for (const item of exercises) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }

  const seed = weekSeed() + userId.length + goal.length;
  const mixed = shuffle(unique, seed);
  const notes = DAY_NOTES[goal] || DAY_NOTES.MAINTAIN;
  const perDay = goal === "LOSE_WEIGHT" ? 5 : goal === "GAIN_MUSCLE" ? 4 : 4;

  await prisma.workoutPlan.deleteMany({ where: { userId } });

  const plan = await prisma.workoutPlan.create({
    data: {
      userId,
      days: {
        create: Array.from({ length: 7 }, (_, index) => {
          const dayOfWeek = index + 1;
          const isRest = dayOfWeek === 7;
          const count = isRest ? Math.min(3, mixed.length) : Math.min(perDay, mixed.length);
          const offset = (index * 3 + seed) % mixed.length;
          const picked = [];
          for (let i = 0; i < count; i += 1) {
            picked.push(mixed[(offset + i) % mixed.length]);
          }
          return {
            dayOfWeek,
            notes: notes[index],
            exercises: {
              create: picked.map((exercise, order) => ({
                order,
                exerciseId: exercise.id,
              })),
            },
          };
        }),
      },
    },
    include: {
      days: {
        orderBy: { dayOfWeek: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: {
              exercise: {
                include: { categories: { include: { category: true } } },
              },
            },
          },
        },
      },
    },
  });

  return plan;
}

export async function getLatestPlan(userId) {
  return prisma.workoutPlan.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      days: {
        orderBy: { dayOfWeek: "asc" },
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: {
              exercise: {
                include: { categories: { include: { category: true } } },
              },
            },
          },
        },
      },
    },
  });
}
