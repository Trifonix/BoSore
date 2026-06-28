import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  count: number;
  /** Неоновая подсветка (лайкнуто / есть лайки) */
  highlighted: boolean;
  readonly?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  layout?: "inline" | "stack";
  "aria-label"?: string;
  "aria-pressed"?: boolean;
};

export function LikeStat({
  count,
  highlighted,
  readonly = false,
  disabled = false,
  onClick,
  layout = "inline",
  "aria-label": ariaLabel,
  "aria-pressed": ariaPressed,
}: Props) {
  const inner = (
    <>
      <span className="like-stat-icon-wrap">
        <ThumbsUp
          className={cn(
            "like-stat-icon",
            highlighted && "like-stat-icon--active",
          )}
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "like-stat-count",
          highlighted && "like-stat-count--active",
        )}
      >
        {count}
      </span>
    </>
  );

  const rootClass = cn(
    "like-stat",
    layout === "inline" && "like-stat--inline",
    highlighted && "like-stat--active",
    readonly && "like-stat--readonly",
  );

  if (readonly) {
    return (
      <span className={rootClass} aria-label={ariaLabel ?? `${count} лайков`}>
        {inner}
      </span>
    );
  }

  return (
    <button
      type="button"
      className={rootClass}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      disabled={disabled}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}
