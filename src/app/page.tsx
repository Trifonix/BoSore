import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SourceWithVotes = Awaited<
  ReturnType<
    typeof prisma.source.findMany<{
      include: { _count: { select: { votes: true } } };
    }>
  >
>;

export default async function HomePage() {
  let sources: SourceWithVotes = [];
  let dbError: string | null = null;

  try {
    sources = await prisma.source.findMany({
      where: { visibility: "PUBLIC" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { votes: true } },
      },
    });
  } catch (error) {
    dbError = getDbErrorMessage(error);
  }

  return (
    <div className="page">
      <header className="header">
        <h1 className="logo">BoSore</h1>
        <p className="subtitle">
          Описания книг и статей с оформлением по ГОСТ для списка литературы
        </p>
        {!dbError && sources.length > 0 && (
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

      {dbError ? (
        <p className="empty">
          Не удалось подключиться к базе данных.
          <br />
          <br />
          {dbError}
          <br />
          <br />
          Проверьте <code>DATABASE_URL</code> в <code>.env</code>. Для Neon
          откройте проект в{" "}
          <a href="https://console.neon.tech" target="_blank" rel="noreferrer">
            console.neon.tech
          </a>{" "}
          — база могла «уснуть» после простоя.
        </p>
      ) : sources.length === 0 ? (
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

function getDbErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return error.message.split("\n")[0];
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Неизвестная ошибка подключения";
}
