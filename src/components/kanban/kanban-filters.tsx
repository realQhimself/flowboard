"use client";

import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRIORITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

import type { Label } from "@/types";

interface KanbanFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: number[];
  onPriorityFilterChange: (priorities: number[]) => void;
  labelFilter: string[];
  onLabelFilterChange: (labelIds: string[]) => void;
  labels: Label[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function KanbanFilters({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  labelFilter,
  onLabelFilterChange,
  labels,
  hasActiveFilters,
  onClearFilters,
}: KanbanFiltersProps) {
  const t = useTranslations("common");
  const tTask = useTranslations("task");

  function togglePriority(priority: number) {
    if (priorityFilter.includes(priority)) {
      onPriorityFilterChange(priorityFilter.filter((p) => p !== priority));
    } else {
      onPriorityFilterChange([...priorityFilter, priority]);
    }
  }

  function toggleLabel(labelId: string) {
    if (labelFilter.includes(labelId)) {
      onLabelFilterChange(labelFilter.filter((id) => id !== labelId));
    } else {
      onLabelFilterChange([...labelFilter, labelId]);
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("searchTasks")}
          className="pl-8 h-8 w-[200px] text-sm"
        />
      </div>

      {/* Priority toggles */}
      <div className="flex items-center gap-1">
        {PRIORITIES.map((p) => (
          <Button
            key={p.value}
            variant={priorityFilter.includes(p.value) ? "default" : "outline"}
            size="xs"
            onClick={() => togglePriority(p.value)}
            className={cn(
              "text-[11px] font-medium",
              priorityFilter.includes(p.value) && "text-white"
            )}
            style={
              priorityFilter.includes(p.value)
                ? { backgroundColor: p.color, borderColor: p.color }
                : undefined
            }
          >
            P{p.value}
          </Button>
        ))}
      </div>

      {/* Label filter */}
      {labels.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="xs" className="text-[11px]">
              {tTask("labels")}
              {labelFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {labelFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            {labels.map((label) => (
              <DropdownMenuCheckboxItem
                key={label.id}
                checked={labelFilter.includes(label.id)}
                onCheckedChange={() => toggleLabel(label.id)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm">{label.name}</span>
                </div>
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="xs"
          onClick={onClearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
