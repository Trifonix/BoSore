import { PrismaClient, Visibility } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "seed@bosore.test" },
    update: {},
    create: { email: "seed@bosore.test", name: "Seed User" },
  });

  const category =
    (await prisma.category.findFirst({ where: { category: "Книги" } })) ??
    (await prisma.category.create({ data: { category: "Книги" } }));

  await prisma.source.deleteMany({ where: { ownerId: user.id } });

  await prisma.source.createMany({
    data: [
      {
        ownerId: user.id,
        categoryId: category.id,
        title: "SICP",
        content:
          "Фундаментальный учебник по программированию: абстракция данных, интерпретация языков и построение интерпретаторов на примере Scheme.",
        description:
          "Абельсон Х., Сассман Д. Структура и интерпретация компьютерных программ / Х. Абельсон, Д. Сассман. — 2-е изд. — М.: Диалектика, 2019. — 608 с.",
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
      },
      {
        ownerId: user.id,
        categoryId: category.id,
        title: "Clean Code",
        content:
          "Практическое руководство по написанию читаемого и поддерживаемого кода: именование, функции, тестирование и рефакторинг.",
        description:
          "Мартин Р. Чистый код: создание, анализ и рефакторинг / Р. Мартин; пер. с англ. — СПб.: Питер, 2020. — 464 с.",
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
