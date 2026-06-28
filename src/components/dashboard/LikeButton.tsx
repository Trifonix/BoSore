"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const router = useRouter();
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
        layout === "inline" ? "home-like-btn" : "flex flex-col items-center gap-0.5",
      )}
    >
      <div className={cn("flex items-center gap-1", layout === "inline" && "home-like-row")}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
          aria-pressed={liked}
          disabled={loading}
          onClick={handleClick}
        >
          <ThumbsUp
            className={cn(
              "h-4 w-4 transition-colors",
              liked
                ? "fill-[var(--neon-cyan)] text-[var(--neon-cyan)] drop-shadow-[0_0_6px_rgba(0,255,245,0.6)]"
                : "text-muted-foreground",
            )}
          />
        </Button>
        <span
          className={cn(
            "min-w-[1.25rem] text-sm tabular-nums",
            liked ? "text-[var(--neon-cyan)]" : "text-muted-foreground",
          )}
        >
          {count}
        </span>
      </div>
      {error && (
        <span className="max-w-[8rem] text-center text-[0.65rem] leading-tight text-destructive">
          {error}
        </span>
      )}
    </div>
  );
}
