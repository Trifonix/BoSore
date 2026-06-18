import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <h1>BoSore</h1>
      <p className="subtitle">
        Описания книг и статей с оформлением по ГОСТ для списка литературы
      </p>

      {items.length === 0 ? (
        <p className="empty">
          Записей пока нет. Выполните миграцию и seed:{" "}
          <code>npm run db:migrate</code>, затем <code>npm run db:seed</code>.
        </p>
      ) : (
        <ul className="list">
          {items.map((item) => (
            <li key={item.id} className="item">
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <time dateTime={item.createdAt.toISOString()}>
                {item.createdAt.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
