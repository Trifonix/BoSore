import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-[var(--neon-cyan)] to-[#7fffeb] text-[#041014] shadow-[0_0_16px_rgba(0,255,245,0.25)] hover:brightness-105",
        outline:
          "border border-[rgba(0,255,245,0.25)] bg-transparent text-[var(--text-primary)] hover:bg-[rgba(0,255,245,0.08)] hover:text-[var(--neon-cyan)] hover:border-[rgba(0,255,245,0.35)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[rgba(0,255,245,0.08)] hover:text-[var(--neon-cyan)]",
        destructive:
          "bg-[rgba(255,45,149,0.18)] text-[var(--neon-magenta)] border border-[rgba(255,45,149,0.4)] hover:bg-[rgba(255,45,149,0.28)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
