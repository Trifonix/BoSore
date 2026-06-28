import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { PublicSourceLike } from "@/components/public/PublicSourceLike";
import type { PublicSourceCardItem } from "@/lib/data/sources";

type Props = {
  source: PublicSourceCardItem;
  isAuthenticated: boolean;
};

function previewText(text: string, max = 160): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function PublicSourceCard({ source, isAuthenticated }: Props) {
  const author = source.ownerName ?? "Аноним";
  const date = source.createdAt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="public-source-card">
      <CardContent className="space-y-4 pt-5">
        <p className="source-text-content">{previewText(source.content)}</p>

        {source.description && (
          <p className="source-text-gost">{previewText(source.description, 200)}</p>
        )}

        <p className="source-card-meta">
          <span>Автор: {author}</span>
          <span aria-hidden> · </span>
          <time dateTime={source.createdAt.toISOString()}>{date}</time>
        </p>

        {source.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {source.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href={`/sources/${source.id}`}>Открыть</Link>
        </Button>
        <PublicSourceLike
          sourceId={source.id}
          likesCount={source.likesCount}
          likedByMe={source.likedByMe}
          isAuthenticated={isAuthenticated}
        />
      </CardFooter>
    </Card>
  );
}
