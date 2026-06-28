import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PublicSourceCard } from "@/components/public/PublicSourceCard";
import type { PublicSourceCardItem } from "@/lib/data/sources";

type Props = {
  title: string;
  description: string;
  sources: PublicSourceCardItem[];
  isAuthenticated: boolean;
  emptyMessage: string;
};

export function SourceSection({
  title,
  description,
  sources,
  isAuthenticated,
  emptyMessage,
}: Props) {
  return (
    <section className="home-section">
      <div className="home-section-head">
        <h2 className="home-section-title">{title}</h2>
        <p className="home-section-desc">{description}</p>
      </div>

      {sources.length === 0 ? (
        <p className="empty">{emptyMessage}</p>
      ) : (
        <ul className="public-source-grid">
          {sources.map((source) => (
            <li key={source.id}>
              <PublicSourceCard source={source} isAuthenticated={isAuthenticated} />
            </li>
          ))}
        </ul>
      )}

      <div className="home-section-more">
        <Button asChild variant="outline" size="sm">
          <Link href="/catalog">Смотреть в каталоге</Link>
        </Button>
      </div>
    </section>
  );
}
