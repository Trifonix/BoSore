import { PrismaClient, Visibility } from "@prisma/client";

const prisma = new PrismaClient();

const TEST_EMAIL = "verify@bosore.test";

async function main() {
  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: { name: "Verify User" },
    create: { email: TEST_EMAIL, name: "Verify User" },
  });

  let category = await prisma.category.findFirst({
    where: { category: "Проверка" },
  });
  if (!category) {
    category = await prisma.category.create({
      data: { category: "Проверка" },
    });
  }

  const source = await prisma.source.upsert({
    where: { id: "verify-test-source" },
    update: {
      title: "verify-test",
      content:
        "Учебное пособие для проверки схемы БД: основы библиографического описания источников.",
      description:
        "Иванов И.И. Тестовая книга / И.И. Иванов. — М.: Издательство, 2024. — 100 с.",
      visibility: Visibility.PRIVATE,
      categoryId: category.id,
      ownerId: user.id,
    },
    create: {
      id: "verify-test-source",
      ownerId: user.id,
      categoryId: category.id,
      title: "verify-test",
      content:
        "Учебное пособие для проверки схемы БД: основы библиографического описания источников.",
      description:
        "Иванов И.И. Тестовая книга / И.И. Иванов. — М.: Издательство, 2024. — 100 с.",
      visibility: Visibility.PRIVATE,
    },
  });

  const like = await prisma.like.upsert({
    where: {
      userId_sourceId: {
        userId: user.id,
        sourceId: source.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      sourceId: source.id,
    },
  });

  console.log("OK: тестовые данные созданы (пользователь, источник, лайк)");
  console.log({ userId: user.id, sourceId: source.id, likeId: like.id });
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
