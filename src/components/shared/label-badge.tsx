"use client";

import { cn } from "@/lib/utils";

interface LabelBadgeProps {
  name: string;
  color: string;
  className?: string;
  onClick?: () => void;
}

export function LabelBadge({ name, color, className, onClick }: LabelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium cursor-default",
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
      onClick={onClick}
    >
      {name}
    </span>
  );
}
