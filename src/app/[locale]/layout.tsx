import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  return <LocaleLayoutInner params={params}>{children}</LocaleLayoutInner>;
}

async function LocaleLayoutInner({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "zh")) {
    notFound();
  }

  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <div className="flex h-screen overflow-hidden">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-y-auto p-6">
                  {children}
                </main>
              </div>
            </div>
            <Toaster richColors position="bottom-right" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
