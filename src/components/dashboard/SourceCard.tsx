"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Globe,
  Lock,
  MessageSquare,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  deleteSource,
  toggleFavorite,
  togglePublic,
} from "@/lib/actions/sources";
import { LikeButton } from "@/components/dashboard/LikeButton";
import type { SourceDTO } from "@/lib/data/sources";
import { cn } from "@/lib/utils";

type Props = {
  source: SourceDTO;
  currentUserId: string;
  onEdit: (source: SourceDTO) => void;
  canToggleFavorite?: boolean;
  showLikes?: boolean;
};

function preview(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function SourceCard({
  source,
  currentUserId,
  onEdit,
  canToggleFavorite = true,
  showLikes = false,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [local, setLocal] = useState(source);
  const isOwner = source.ownerId === currentUserId;

  const date = local.createdAt.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function runAction(action: () => Promise<unknown>, optimistic?: Partial<SourceDTO>) {
    startTransition(async () => {
      if (optimistic) setLocal((prev) => ({ ...prev, ...optimistic }));
      try {
        await action();
      } catch {
        setLocal(source);
      }
    });
  }

  const deleteLabel = preview(local.content, 40);

  return (
    <article
      className={cn("dashboard-card", isPending && "opacity-70 pointer-events-none")}
    >
      <div className="dashboard-card-icon">
        <MessageSquare className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="source-field-label mb-1">Описание</p>
          <p className="dashboard-card-preview">{preview(local.content)}</p>
        </div>
        {local.description && (
          <div>
            <p className="source-field-label mb-1">По ГОСТ</p>
            <p className="dashboard-card-preview text-[var(--text-muted)]">
              {preview(local.description, 100)}
            </p>
          </div>
        )}
        <p className="dashboard-card-meta">
          Автор: {isOwner ? "вы" : (local.ownerName ?? "—")} · {date}
        </p>
        {local.isPublic && (
          <Button asChild variant="outline" size="sm" className="mt-1">
            <Link href={`/sources/${local.id}`}>Открыть</Link>
          </Button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {showLikes && local.isPublic && (
          <LikeButton
            sourceId={local.id}
            initialLiked={local.likedByMe ?? false}
            initialCount={local.likesCount ?? 0}
          />
        )}

        {canToggleFavorite && isOwner && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Избранное"
            onClick={() =>
              runAction(() => toggleFavorite(local.id), {
                isFavorite: !local.isFavorite,
              })
            }
          >
            <Star
              className={cn(
                "h-4 w-4",
                local.isFavorite
                  ? "fill-[var(--neon-magenta)] text-[var(--neon-magenta)] drop-shadow-[0_0_6px_rgba(255,45,149,0.6)]"
                  : "text-muted-foreground",
              )}
            />
          </Button>
        )}

        {isOwner && (
          <>
            <Button
              variant="ghost"
              size="icon"
              aria-label={local.isPublic ? "Сделать приватным" : "Сделать публичным"}
              onClick={() =>
                runAction(() => togglePublic(local.id), {
                  isPublic: !local.isPublic,
                })
              }
            >
              {local.isPublic ? (
                <Globe className="h-4 w-4 text-[var(--neon-cyan)]" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Редактировать"
              onClick={() => onEdit(local)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Удалить"
              onClick={() => {
                if (window.confirm(`Удалить источник «${deleteLabel}»?`)) {
                  runAction(() => deleteSource(local.id));
                }
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
