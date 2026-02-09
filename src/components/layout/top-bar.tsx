"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileSidebar } from "./app-sidebar";
import { cn } from "@/lib/utils";

function useCurrentPageName(): string {
  const t = useTranslations("nav");
  const pathname = usePathname();

  if (pathname === "/") return t("dashboard");
  if (pathname.startsWith("/board")) return t("board");
  if (pathname.startsWith("/calendar")) return t("calendar");
  if (pathname.startsWith("/todos")) return t("todos");
  if (pathname.startsWith("/projects")) return t("projects");
  if (pathname.startsWith("/settings")) return t("settings");

  return "";
}

export function TopBar() {
  const t = useTranslations("common");
  const pageName = useCurrentPageName();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-30 flex items-center h-12 px-4 border-b bg-background/80 backdrop-blur-sm",
          "shrink-0"
        )}
      >
        {/* Left: hamburger (mobile) + breadcrumb */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden text-muted-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-4" />
          </Button>
          <h1 className="text-sm font-semibold text-foreground">{pageName}</h1>
        </div>

        <div className="flex-1" />

        {/* Right: command palette, locale, theme */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-2 hidden sm:flex"
          >
            <Search className="size-3.5" />
            <span className="text-xs">{t("search")}</span>
            <kbd className="pointer-events-none ml-1 inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="sm:hidden text-muted-foreground"
          >
            <Search className="size-4" />
          </Button>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {/* Logo in mobile sheet */}
          <div className="flex items-center h-12 px-3 gap-2 border-b shrink-0">
            <div className="flex items-center justify-center size-8 rounded-lg bg-primary">
              <span className="text-primary-foreground font-bold text-sm">F</span>
            </div>
            <span className="font-semibold text-foreground text-sm">
              FlowBoard
            </span>
          </div>
          <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
        </SheetContent>
      </Sheet>
    </>
  );
}
