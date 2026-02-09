"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AddColumnButtonProps {
  onCreateColumn: (name: string) => Promise<void>;
}

export function AddColumnButton({ onCreateColumn }: AddColumnButtonProps) {
  const t = useTranslations("board");
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;

    setIsCreating(true);
    try {
      await onCreateColumn(trimmed);
      setName("");
      setIsAdding(false);
    } finally {
      setIsCreating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleCreate();
    }
    if (e.key === "Escape") {
      setIsAdding(false);
      setName("");
    }
  }

  if (isAdding) {
    return (
      <div className="shrink-0 w-[280px] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 p-3">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!name.trim()) {
              setIsAdding(false);
            }
          }}
          placeholder={t("columnName")}
          disabled={isCreating}
          className="text-sm"
        />
        <p className="text-[10px] text-muted-foreground mt-1.5 px-1">
          Enter ↵
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="shrink-0 w-[280px] min-h-[120px] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
    >
      <Plus className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm text-muted-foreground font-medium">
        {t("addColumn")}
      </span>
    </button>
  );
}
