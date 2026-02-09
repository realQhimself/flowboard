"use client";

import { PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: number;
  size?: "sm" | "md";
  className?: string;
}

export function PriorityBadge({
  priority,
  size = "sm",
  className,
}: PriorityBadgeProps) {
  const p = PRIORITIES.find((pr) => pr.value === priority) ?? PRIORITIES[3];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded font-medium",
        size === "sm" && "px-1.5 py-0.5 text-[10px]",
        size === "md" && "px-2 py-0.5 text-xs",
        className
      )}
      style={{
        backgroundColor: `${p.color}20`,
        color: p.color,
      }}
    >
      P{p.value}
    </span>
  );
}
