"use client";

import { useCallback, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SourceCard } from "@/components/dashboard/SourceCard";
import { SourceDialog } from "@/components/dashboard/SourceDialog";
import { SearchInput } from "@/components/dashboard/SearchInput";
import type { SourceDTO, SourceListResult } from "@/lib/data/sources";

type Props = {
  data: SourceListResult;
  currentUserId: string;
  subtitle: string;
  emptyMessage: string;
  showCreate?: boolean;
  canToggleFavorite?: boolean;
};

export function SourcesView({
  data,
  currentUserId,
  subtitle,
  emptyMessage,
  showCreate = true,
  canToggleFavorite = true,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SourceDTO | null>(null);

  const q = searchParams.get("q") ?? "";
  const page = data.page;

  const pushParams = useCallback(
    (next: { q?: string; page?: number }) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next.q !== undefined) {
        if (next.q) params.set("q", next.q);
        else params.delete("q");
        params.delete("page");
      }
      if (next.page !== undefined) {
        if (next.page > 1) params.set("page", String(next.page));
        else params.delete("page");
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="dashboard-heading">Личный кабинет</h1>
          <h2 className="dashboard-subtitle">{subtitle}</h2>
        </div>
        {showCreate && (
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Новый источник
          </Button>
        )}
      </div>

      <div className="mb-6">
        <SearchInput defaultValue={q} onSearch={(value) => pushParams({ q: value })} />
      </div>

      {data.items.length === 0 ? (
        <div className="dashboard-empty">
          <p>{emptyMessage}</p>
          {showCreate && (
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Создать первый источник
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              currentUserId={currentUserId}
              canToggleFavorite={canToggleFavorite}
              onEdit={(item) => {
                setEditing(item);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Страница {page} из {data.totalPages} · всего {data.total}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => pushParams({ page: page - 1 })}
            >
              Назад
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.totalPages}
              onClick={() => pushParams({ page: page + 1 })}
            >
              Вперёд
            </Button>
          </div>
        </div>
      )}

      <SourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        source={editing}
      />
    </>
  );
}
