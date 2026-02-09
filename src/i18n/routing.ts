import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
});

export const { Link, usePathname, useRouter, redirect, permanentRedirect } =
  createNavigation(routing);
