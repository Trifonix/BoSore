import { Suspense } from "react";
import { auth } from "@/auth";
import { PublicSourceCard } from "@/components/public/PublicSourceCard";
import { getPublicSources } from "@/lib/data/sources";

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
};

export default async function CatalogPage({ searchParams }: PageProps) {
  const session = await auth();
  const { page: pageParam, q = "", sort: sortParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const sort = sortParam === "popular" ? "popular" : "recent";

  const data = await getPublicSources(page, q, sort, session?.user?.id ?? null);
  const isAuthenticated = !!session?.user?.id;

  return (
    <div className="page catalog-page">
      <header className="header">
        <h1 className="page-title">Каталог</h1>
        <p className="subtitle">Все публичные источники сообщества</p>
      </header>

      <Suspense fallback={<p className="text-muted-foreground">Загрузка...</p>}>
        {data.items.length === 0 ? (
          <p className="empty">Публичных источников пока нет</p>
        ) : (
          <ul className="public-source-grid">
            {data.items.map((source) => (
              <li key={source.id}>
                <PublicSourceCard
                  source={{
                    id: source.id,
                    title: source.title,
                    content: source.content,
                    description: null,
                    createdAt: source.createdAt,
                    ownerId: source.ownerId,
                    ownerName: source.ownerName,
                    tags: source.tags ?? [],
                    likesCount: source.likesCount ?? 0,
                    likedByMe: source.likedByMe ?? false,
                  }}
                  isAuthenticated={isAuthenticated}
                />
              </li>
            ))}
          </ul>
        )}
      </Suspense>
    </div>
  );
}
