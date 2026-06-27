import { Suspense } from "react";
import { requireAuth } from "@/lib/auth/session";
import { getFavoriteSources } from "@/lib/data/sources";
import { SourcesView } from "@/components/dashboard/SourcesView";

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function FavoritesPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { page: pageParam, q = "" } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);

  const data = await getFavoriteSources(session.user.id, page, q);

  return (
    <Suspense fallback={<p className="text-muted-foreground">Загрузка...</p>}>
      <SourcesView
        data={data}
        currentUserId={session.user.id}
        subtitle="Избранное"
        emptyMessage="В избранном пока пусто — отметьте источник звездой"
        showCreate={false}
      />
    </Suspense>
  );
}
