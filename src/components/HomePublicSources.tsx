import { LikeStat } from "@/components/LikeStat";
import { formatLikesCountUpper } from "@/lib/format-likes";
import type { PublicSourceFeedItem } from "@/lib/data/sources";

type Props = {
  sources: PublicSourceFeedItem[];
  isAuthenticated: boolean;
};

export function HomePublicSources({ sources, isAuthenticated }: Props) {
  return (
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
          <div className="item-meta">
            <time dateTime={source.createdAt.toISOString()}>
              {source.createdAt.toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </time>
            {isAuthenticated ? (
              <span className="item-likes">
                {formatLikesCountUpper(source.likesCount)}
              </span>
            ) : (
              <LikeStat
                count={source.likesCount}
                highlighted={source.likesCount > 0}
                readonly
                layout="inline"
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
