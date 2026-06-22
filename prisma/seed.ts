import { PrismaClient, Visibility } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "seed@bosore.test" },
    update: {},
    create: { email: "seed@bosore.test", name: "Seed User" },
  });

  const booksCategory =
    (await prisma.category.findFirst({ where: { category: "Книги" } })) ??
    (await prisma.category.create({ data: { category: "Книги" } }));

  const articlesCategory =
    (await prisma.category.findFirst({ where: { category: "Статьи" } })) ??
    (await prisma.category.create({ data: { category: "Статьи" } }));

  await prisma.source.deleteMany({ where: { ownerId: user.id } });

  await prisma.source.createMany({
    data: [
      {
        ownerId: user.id,
        categoryId: booksCategory.id,
        title: "sicp",
        content:
          "Фундаментальный учебник по программированию: абстракция данных, интерпретация языков и построение интерпретаторов на примере Scheme.",
        description:
          "Абельсон Х., Сассман Д. Структура и интерпретация компьютерных программ / Х. Абельсон, Д. Сассман. — 2-е изд. — М.: Диалектика, 2019. — 608 с.",
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
      },
      {
        ownerId: user.id,
        categoryId: booksCategory.id,
        title: "clean-code",
        content:
          "Практическое руководство по написанию читаемого и поддерживаемого кода: именование, функции, тестирование и рефакторинг.",
        description:
          "Мартин Р. Чистый код: создание, анализ и рефакторинг / Р. Мартин; пер. с англ. — СПб.: Питер, 2020. — 464 с.",
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
      },
      {
        ownerId: user.id,
        categoryId: articlesCategory.id,
        title: "nextjs-docs",
        content:
          "Официальная документация по маршрутизации, серверным компонентам и развёртыванию приложений на Next.js App Router.",
        description:
          "Next.js Documentation [Электронный ресурс]. — Режим доступа: https://nextjs.org/docs (дата обращения: 18.06.2026).",
        visibility: Visibility.PUBLIC,
        publishedAt: new Date(),
      },
    ],
  });

  console.log("OK: 3 публичных источника созданы (2 книги, 1 статья)");
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
