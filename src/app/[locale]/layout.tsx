import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { APP_I18N_LANGUAGES } from "@/shared/i18n/config";
import { BottomNav } from "@/components/layout/BottomNav";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { TopNav } from "@/components/layout/TopNav";
import Footer from "@/components/layout/Footer";

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate that the incoming `locale` parameter is valid
  if (!APP_I18N_LANGUAGES.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client for the requested locale
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-page/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center">
            <img 
              src="/MyClock.png" 
              alt="My Clock" 
              className="h-18 w-auto"
            />
          </div>
          <TopNav />
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
      <Footer />
    </NextIntlClientProvider>
  );
}
