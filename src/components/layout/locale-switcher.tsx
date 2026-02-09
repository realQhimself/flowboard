"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTransition } from "react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = () => {
    const nextLocale = locale === "en" ? "zh" : "en";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={switchLocale}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground text-xs font-semibold"
          >
            {locale === "en" ? "EN" : "中"}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{locale === "en" ? "Switch to 中文" : "Switch to English"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
