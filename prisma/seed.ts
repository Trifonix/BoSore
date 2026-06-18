import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.item.deleteMany();

  await prisma.item.createMany({
    data: [
      {
        title:
          "Фундаментальный учебник по программированию: абстракция данных, интерпретация языков и построение интерпретаторов на примере Scheme.",
        description:
          "Абельсон Х., Сассман Д. Структура и интерпретация компьютерных программ / Х. Абельсон, Д. Сассман. — 2-е изд. — М.: Диалектика, 2019. — 608 с.",
      },
      {
        title:
          "Практическое руководство по написанию читаемого и поддерживаемого кода: именование, функции, тестирование и рефакторинг.",
        description:
          "Мартин Р. Чистый код: создание, анализ и рефакторинг / Р. Мартин; пер. с англ. — СПб.: Питер, 2020. — 464 с.",
      },
      {
        title:
          "Официальная документация по маршрутизации, серверным компонентам и развёртыванию приложений на Next.js App Router.",
        description:
          "Next.js Documentation [Электронный ресурс]. — Режим доступа: https://nextjs.org/docs (дата обращения: 18.06.2026).",
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
