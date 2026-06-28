import { auth } from "@/auth";
import { HomePublicSources } from "@/components/HomePublicSources";
import { getPublicSourcesFeed } from "@/lib/data/sources";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  let sources: Awaited<ReturnType<typeof getPublicSourcesFeed>> = [];
  let dbError: string | null = null;

  try {
    sources = await getPublicSourcesFeed(session?.user?.id ?? null);
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
        <HomePublicSources
          sources={sources}
          isAuthenticated={!!session?.user?.id}
        />
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
