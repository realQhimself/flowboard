"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { MoreHorizontal, Pencil, Palette, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { updateColumn, deleteColumn } from "@/actions/column-actions";
import { PROJECT_COLORS } from "@/lib/constants";

import type { Column } from "@/types";

interface KanbanColumnHeaderProps {
  column: Column;
  taskCount: number;
  onColumnUpdate: () => void;
  onColumnDelete: (columnId: string) => void;
}

export function KanbanColumnHeader({
  column,
  taskCount,
  onColumnUpdate,
  onColumnDelete,
}: KanbanColumnHeaderProps) {
  const t = useTranslations("board");
  const tCommon = useTranslations("common");
  const [isRenaming, setIsRenaming] = useState(false);
  const [editName, setEditName] = useState(column.name);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  async function handleRename() {
    const name = editName.trim();
    if (!name || name === column.name) {
      setIsRenaming(false);
      setEditName(column.name);
      return;
    }

    try {
      await updateColumn(column.id, { name });
      setIsRenaming(false);
      onColumnUpdate();
    } catch {
      toast.error("Failed to rename column");
      setEditName(column.name);
      setIsRenaming(false);
    }
  }

  async function handleColorChange(color: string) {
    try {
      await updateColumn(column.id, { color });
      setShowColorPicker(false);
      onColumnUpdate();
    } catch {
      toast.error("Failed to update column color");
    }
  }

  async function handleDelete() {
    try {
      await deleteColumn(column.id);
      onColumnDelete(column.id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete column";
      toast.error(message);
    }
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRename();
    }
    if (e.key === "Escape") {
      setIsRenaming(false);
      setEditName(column.name);
    }
  }

  return (
    <div className="flex items-center justify-between px-2 py-2 mb-2">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: column.color }}
        />

        {isRenaming ? (
          <Input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRename}
            className="h-6 text-sm font-semibold px-1 py-0"
          />
        ) : (
          <span className="text-sm font-semibold truncate">{column.name}</span>
        )}

        <span className="text-xs text-muted-foreground shrink-0">
          ({taskCount})
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0 opacity-0 group-hover:opacity-100 hover:!opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => {
              setIsRenaming(true);
            }}
          >
            <Pencil className="h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowColorPicker(true)}
          >
            <Palette className="h-4 w-4" />
            Change Color
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleDelete}
            disabled={column.isDefault}
          >
            <Trash2 className="h-4 w-4" />
            {tCommon("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Color Picker Popup */}
      {showColorPicker && (
        <div className="absolute top-10 right-0 z-50 bg-popover border rounded-lg shadow-lg p-3">
          <div className="grid grid-cols-7 gap-1.5">
            {PROJECT_COLORS.map((color) => (
              <button
                key={color}
                className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor:
                    color === column.color ? "currentColor" : "transparent",
                }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="xs"
            className="w-full mt-2"
            onClick={() => setShowColorPicker(false)}
          >
            {tCommon("cancel")}
          </Button>
        </div>
      )}
    </div>
  );
}
