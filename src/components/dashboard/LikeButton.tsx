"use client";

import { useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoadingRouter } from "@/hooks/useLoadingRouter";
import { LikeStat } from "@/components/LikeStat";
import { cn } from "@/lib/utils";

type Props = {
  sourceId: string;
  initialLiked: boolean;
  initialCount: number;
  layout?: "stack" | "inline";
};

export function LikeButton({
  sourceId,
  initialLiked,
  initialCount,
  layout = "stack",
}: Props) {
  const router = useLoadingRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (loading) return;

    setLoading(true);
    setError(null);

    const prevLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);

    try {
      const res = await fetch(`/api/sources/${sourceId}/like`, {
        method: "POST",
      });

      if (res.status === 401) {
        setLiked(prevLiked);
        setCount(prevCount);
        const callbackUrl = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        return;
      }

      const data = (await res.json()) as {
        liked?: boolean;
        likesCount?: number;
        error?: string;
      };

      if (!res.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
        setError(data.error ?? "Попробуйте позже");
        return;
      }

      setLiked(data.liked ?? prevLiked);
      setCount(data.likesCount ?? prevCount);
    } catch {
      setLiked(prevLiked);
      setCount(prevCount);
      setError("Попробуйте позже");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        layout === "inline" ? "like-stat-wrap--inline" : "like-stat-wrap",
        loading && "opacity-70 pointer-events-none",
      )}
    >
      <LikeStat
        count={count}
        highlighted={liked}
        disabled={loading}
        layout="inline"
        aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
        aria-pressed={liked}
        onClick={handleClick}
      />
      {error && (
        <span className="like-stat-error">{error}</span>
      )}
    </div>
  );
}
