"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "@/i18n/routing";
import { Sun, Moon, Monitor, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";
import { useTransition } from "react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const themes = [
    { value: "light", label: t("themeLight"), icon: Sun },
    { value: "dark", label: t("themeDark"), icon: Moon },
    { value: "system", label: t("themeSystem"), icon: Monitor },
  ] as const;

  function switchLocale(newLocale: "en" | "zh") {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("theme")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {themes.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={theme === value ? "default" : "outline"}
                className={cn("flex-1 gap-2")}
                onClick={() => setTheme(value)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Languages className="h-5 w-5" />
            {t("language")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={locale === "en" ? "default" : "outline"}
              className="flex-1"
              onClick={() => switchLocale("en")}
              disabled={isPending}
            >
              {t("english")}
            </Button>
            <Button
              variant={locale === "zh" ? "default" : "outline"}
              className="flex-1"
              onClick={() => switchLocale("zh")}
              disabled={isPending}
            >
              {t("chinese")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
