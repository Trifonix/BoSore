import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(0,255,245,0.25)] bg-[rgba(0,255,245,0.08)] text-[var(--neon-cyan)]",
        secondary:
          "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.04)] text-[var(--text-secondary)]",
        outline: "border-[var(--border-dim)] text-[var(--text-secondary)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
