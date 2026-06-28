import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/session";
import { getPublicSources, type SourceSort } from "@/lib/data/sources";
import { SourcesView } from "@/components/dashboard/SourcesView";

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>;
};

function parseSort(value: string | undefined): SourceSort {
  return value === "popular" ? "popular" : "recent";
}

export default async function PublicSourcesPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { page: pageParam, q = "", sort: sortParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const sort = parseSort(sortParam);

  const data = await getPublicSources(page, q, sort, session.user.id);

  return (
    <Suspense fallback={<p className="text-muted-foreground">Загрузка...</p>}>
      <SourcesView
        data={data}
        currentUserId={session.user.id}
        subtitle="Публичные источники"
        emptyMessage="Публичных источников пока нет"
        showCreate={false}
        showLikes
        sort={sort}
      />
    </Suspense>
  );
}
