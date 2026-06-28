"use client";

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

  const preview =
    local.content.length > 140
      ? `${local.content.slice(0, 140)}…`
      : local.content;

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

  return (
    <article
      className={cn("dashboard-card", isPending && "opacity-70 pointer-events-none")}
    >
      <div className="dashboard-card-icon">
        <MessageSquare className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="dashboard-card-title">{local.title}</h3>
        <p className="dashboard-card-preview">{preview}</p>
        {!isOwner && local.ownerName && (
          <p className="dashboard-card-meta">Автор: {local.ownerName}</p>
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
                if (window.confirm(`Удалить «${local.title}»?`)) {
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
