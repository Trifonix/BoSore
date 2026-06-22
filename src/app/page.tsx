import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const sources = await prisma.source.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { votes: true } },
    },
  });

  return (
    <div className="page">
      <header className="header">
        <h1 className="logo">BoSore</h1>
        <p className="subtitle">
          Описания книг и статей с оформлением по ГОСТ для списка литературы
        </p>
        {sources.length > 0 && (
          <span className="badge">
            <span className="badge-dot" />
            {sources.length}{" "}
            {sources.length === 1
              ? "источник"
              : sources.length < 5
                ? "источника"
                : "источников"}
          </span>
        )}
      </header>

      {sources.length === 0 ? (
        <p className="empty">
          Публичных источников пока нет. Выполните{" "}
          <code>npm run db:verify</code> для проверки схемы.
        </p>
      ) : (
        <ul className="list">
          {sources.map((source) => (
            <li key={source.id} className="item">
              <p className="item-summary">{source.content}</p>
              {source.description && (
                <p className="item-gost">
                  <span className="item-gost-label">По ГОСТ</span>
                  {source.description}
                </p>
              )}
              <time dateTime={source.createdAt.toISOString()}>
                {source.createdAt.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {" · "}
                {source._count.votes}{" "}
                {source._count.votes === 1 ? "голос" : "голосов"}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
