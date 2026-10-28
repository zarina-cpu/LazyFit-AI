const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CATEGORIES = [
  "Для лица",
  "Для шеи",
  "Для спины",
  "Для рук",
  "Для ног",
  "Для ягодиц",
  "Для пресса",
  "Для кора",
  "Для ленивых",
];

const EXERCISES = [
  {
    title: "Ленивый подъём таза на диване",
    description:
      "Лёжа на диване, стопы на полу. Медленно поднимайте таз вверх, задерживаясь в верхней точке на 2 секунды. Идеально во время сериала.",
    categories: ["Для ягодиц", "Для ног", "Для ленивых"],
    mediaType: "IMAGE",
  },
  {
    title: "Сжимание подушки коленями",
    description:
      "Сидя или лёжа, зажмите подушку между коленями и мягко сжимайте 8–12 раз. Никуда ходить не нужно, работает внутренняя поверхность бедра.",
    categories: ["Для ног", "Для ленивых"],
    mediaType: "IMAGE",
  },
  {
    title: "Планка с колен у ковра",
    description:
      "Обопритесь на предплечья и колени. Корпус — прямая линия от макушки до колен. Держите 20–30 секунд, дышите. Без колен — только если уже не лень.",
    categories: ["Для кора", "Для пресса", "Для спины"],
    mediaType: "IMAGE",
  },
  {
    title: "Мёртвый жук на полу",
    description:
      "Лёжа на спине, колени над тазом. Медленно выпрямляйте противоположные руку и ногу, не отрывая поясницу от пола. 6–8 раз на сторону.",
    categories: ["Для кора", "Для пресса", "Для спины"],
    mediaType: "IMAGE",
  },
  {
    title: "Кошка-корова у дивана",
    description:
      "На четвереньках мягко прогибайте и округляйте спину в ритме дыхания. 10 циклов. Снимает «офисную» спину после горизонтального дня.",
    categories: ["Для спины", "Для кора", "Для ленивых"],
    mediaType: "IMAGE",
  },
  {
    title: "Отжимания от края дивана",
    description:
      "Руки на подлокотник или сиденье, тело по диагонали. Сгибайте локти, грудь ближе к дивану. 6–10 раз. Чем выше опора, тем ленивее и легче.",
    categories: ["Для рук", "Для кора"],
    mediaType: "IMAGE",
  },
  {
    title: "Бутылки-гантели на бицепс",
    description:
      "Две бутылки воды. Сидя, локти прижаты к корпусу, поднимайте бутылки к плечам. Медленно вниз. 10 повторов. Сериал можно не ставить на паузу.",
    categories: ["Для рук", "Для ленивых"],
    mediaType: "IMAGE",
  },
  {
    title: "Подъёмы на носки у холодильника",
    description:
      "Пока греется чайник, поднимайтесь на носки и медленно опускайтесь. 12–15 раз. Икры работают, лень почти не заметила.",
    categories: ["Для ног", "Для ленивых"],
    mediaType: "IMAGE",
  },
  {
    title: "Скручивания лёжа «в полсилы»",
    description:
      "Лёжа на спине, подбородок слегка к груди, поднимайте лопатки от пола. Не рвите шею руками. 8–12 медленных повторов.",
    categories: ["Для пресса", "Для кора"],
    mediaType: "IMAGE",
  },
  {
    title: "Покачивания шеей у экрана",
    description:
      "Сидя ровно, медленно наклоняйте ухо к плечу, затем подбородок к груди. Без кругов назад. По 20 секунд. Снимает «шею сериаломана».",
    categories: ["Для шеи", "Для ленивых"],
    mediaType: "IMAGE",
  },
  {
    title: "Улыбка с сопротивлением",
    description:
      "Улыбнитесь так широко, как можете, пальцами слегка мешая уголкам губ. Удержите 8 секунд, расслабьте. 5 раз. Фейсфитнес без съёмок в сторис.",
    categories: ["Для лица", "Для ленивых"],
    mediaType: "IMAGE",
  },
  {
    title: "Жираф: вытяжение шеи",
    description:
      "Представьте, что макушку тянут к потолку. Подбородок чуть внутрь, плечи опущены. 5 циклов по 10 секунд. Можно делать в паузе между сериями.",
    categories: ["Для шеи", "Для лица"],
    mediaType: "IMAGE",
  },
  {
    title: "Ягодичный мостик одной ногой (облегчённый)",
    description:
      "Как обычный мостик, но одна нога чуть приподнята или лежит на пятке. Амплитуда маленькая. Если тяжело — обе стопы на полу, и это тоже победа.",
    categories: ["Для ягодиц", "Для ног", "Для кора"],
    mediaType: "IMAGE",
  },
  {
    title: "Дыхание 4-6 на спине",
    description:
      "Лёжа, одна рука на животе. Вдох на 4, выдох на 6. 8 циклов. Снижает «мне ничего не хочется» и готовит к паре ленивых подходов.",
    categories: ["Для кора", "Для ленивых"],
    mediaType: "IMAGE",
  },
];

async function main() {
  for (const name of CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const categories = await prisma.category.findMany();
  const byName = Object.fromEntries(categories.map((item) => [item.name, item]));

  const existingLibrary = await prisma.exercise.findFirst({
    where: { isCustom: false, userId: null },
  });

  if (!existingLibrary) {
    for (const item of EXERCISES) {
      const exercise = await prisma.exercise.create({
        data: {
          title: item.title,
          description: item.description,
          mediaType: item.mediaType,
          isCustom: false,
        },
      });
      await prisma.categoriesOnExercises.createMany({
        data: item.categories.map((name) => ({
          exerciseId: exercise.id,
          categoryId: byName[name].id,
        })),
      });
    }
  }

  await prisma.user.upsert({
    where: { email: "lazy@lazyfit.app" },
    update: { name: "Ленивый чемпион", targetGoal: "LOSE_WEIGHT" },
    create: {
      email: "lazy@lazyfit.app",
      name: "Ленивый чемпион",
      emailVerified: new Date(),
      phone: "+79990000000",
      phoneVerified: new Date(),
      targetGoal: "LOSE_WEIGHT",
    },
  });

  console.log("LazyFit seed ready");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
