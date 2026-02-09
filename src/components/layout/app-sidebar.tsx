"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Kanban,
  Calendar,
  CheckSquare,
  FolderKanban,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { motion } from "framer-motion";

const SIDEBAR_COLLAPSED_KEY = "flowboard_sidebar_collapsed";

interface NavItem {
  labelKey: string;
  icon: React.ElementType;
  href: string;
}

const mainNavItems: NavItem[] = [
  { labelKey: "dashboard", icon: LayoutDashboard, href: "/" },
  { labelKey: "board", icon: Kanban, href: "/board" },
  { labelKey: "calendar", icon: Calendar, href: "/calendar" },
  { labelKey: "todos", icon: CheckSquare, href: "/todos" },
  { labelKey: "projects", icon: FolderKanban, href: "/projects" },
];

const bottomNavItems: NavItem[] = [
  { labelKey: "settings", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") setCollapsed(true);
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar border-r border-sidebar-border",
        "sticky top-0 shrink-0 overflow-hidden"
      )}
    >
      {/* Logo area */}
      <div className="flex items-center h-12 px-3 gap-2 shrink-0">
        <div className="flex items-center justify-center size-8 rounded-lg bg-primary shrink-0">
          <span className="text-primary-foreground font-bold text-sm">F</span>
        </div>
        {!collapsed && mounted && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-semibold text-sidebar-foreground text-sm truncate"
          >
            FlowBoard
          </motion.span>
        )}
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={toggleCollapsed}
          className="text-muted-foreground hover:text-foreground shrink-0"
        >
          {collapsed ? (
            <PanelLeft className="size-3.5" />
          ) : (
            <PanelLeftClose className="size-3.5" />
          )}
        </Button>
      </div>

      <Separator />

      {/* Main navigation */}
      <nav className="flex-1 flex flex-col gap-1 p-2 overflow-y-auto overflow-x-hidden">
        <TooltipProvider delayDuration={0}>
          {mainNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const label = t(item.labelKey as any);

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md text-sm font-medium transition-colors relative",
                  "h-9 shrink-0",
                  collapsed ? "justify-center px-0 mx-auto w-10" : "px-3",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-primary"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon className="size-4 shrink-0" />
                {!collapsed && mounted && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </Link>
            );

            if (collapsed && mounted) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </TooltipProvider>
      </nav>

      <Separator />

      {/* Bottom navigation (settings) */}
      <div className="p-2 shrink-0">
        <TooltipProvider delayDuration={0}>
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const label = t(item.labelKey as any);

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md text-sm font-medium transition-colors relative",
                  "h-9 shrink-0",
                  collapsed ? "justify-center px-0 mx-auto w-10" : "px-3",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active-bottom"
                    className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-primary"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <Icon className="size-4 shrink-0" />
                {!collapsed && mounted && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </Link>
            );

            if (collapsed && mounted) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.href}>{linkContent}</div>;
          })}
        </TooltipProvider>
      </div>
    </motion.aside>
  );
}

/* ---- Mobile sidebar (sheet) ---- */
export function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {mainNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const label = t(item.labelKey as any);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 h-10 text-sm font-medium transition-colors relative",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary" />
              )}
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Bottom settings */}
      <div className="p-3">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const label = t(item.labelKey as any);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 h-10 text-sm font-medium transition-colors relative",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              {active && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary" />
              )}
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
