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
import type { SourceDTO } from "@/lib/data/sources";
import { cn } from "@/lib/utils";

type Props = {
  source: SourceDTO;
  currentUserId: string;
  onEdit: (source: SourceDTO) => void;
  canToggleFavorite?: boolean;
};

export function SourceCard({
  source,
  currentUserId,
  onEdit,
  canToggleFavorite = true,
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
      className={cn(
        "flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        isPending && "opacity-70",
      )}
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
        <MessageSquare className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-800">{local.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{preview}</p>
        {!isOwner && local.ownerName && (
          <p className="mt-1 text-xs text-muted-foreground">Автор: {local.ownerName}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
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
                  ? "fill-amber-400 text-amber-400"
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
                <Globe className="h-4 w-4 text-sky-600" />
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
