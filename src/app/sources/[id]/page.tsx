import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicSourceLike } from "@/components/public/PublicSourceLike";
import { getPublicSourceById } from "@/lib/data/sources";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SourcePage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;
  const source = await getPublicSourceById(id, session?.user?.id ?? null);

  if (!source) {
    notFound();
  }

  const isAuthenticated = !!session?.user?.id;
  const author = source.ownerName ?? "Аноним";
  const date = source.createdAt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="page source-detail-page">
      <header className="header">
        <p className="source-detail-meta">
          {author} · {date}
        </p>
        <h1 className="page-title">{source.title}</h1>
        {source.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {source.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <article className="source-detail-body">
        <p className="source-detail-content">{source.content}</p>
        {source.description && (
          <div className="item-gost mt-6">
            <span className="item-gost-label">По ГОСТ</span>
            {source.description}
          </div>
        )}
      </article>

      <footer className="source-detail-footer">
        <PublicSourceLike
          sourceId={source.id}
          likesCount={source.likesCount}
          likedByMe={source.likedByMe}
          isAuthenticated={isAuthenticated}
        />
        <Button asChild variant="outline" size="sm">
          <Link href="/catalog">← К каталогу</Link>
        </Button>
      </footer>
    </div>
  );
}
