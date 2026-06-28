import { auth } from "@/auth";
import { HomeHero } from "@/components/home/HomeHero";
import { SourceSection } from "@/components/home/SourceSection";
import { Separator } from "@/components/ui/separator";
import { getHomePageSources } from "@/lib/data/sources";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;
  const isAuthenticated = !!userId;

  let recent: Awaited<ReturnType<typeof getHomePageSources>>["recent"] = [];
  let popular: Awaited<ReturnType<typeof getHomePageSources>>["popular"] = [];
  let dbError: string | null = null;

  try {
    ({ recent, popular } = await getHomePageSources(userId));
  } catch (error) {
    dbError = getDbErrorMessage(error);
  }

  return (
    <div className="page home-page">
      <HomeHero isAuthenticated={isAuthenticated} />

      {dbError ? (
        <p className="empty">
          Не удалось подключиться к базе данных.
          <br />
          <br />
          {dbError}
        </p>
      ) : (
        <>
          <SourceSection
            title="Новые"
            description="Последние опубликованные источники"
            sources={recent}
            isAuthenticated={isAuthenticated}
            emptyMessage="Публичных источников пока нет"
          />

          <Separator className="my-10" />

          <SourceSection
            title="Популярные"
            description="Источники с наибольшим числом лайков"
            sources={popular}
            isAuthenticated={isAuthenticated}
            emptyMessage="Пока нет источников с лайками"
          />
        </>
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
