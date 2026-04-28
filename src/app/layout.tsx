import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { BottomNav } from "@/components/layout/BottomNav";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { TopNav } from "@/components/layout/TopNav";
import Footer from "@/components/layout/Footer";
import { APP_FULL_NAME, APP_VERSION } from "@/config/version";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_FULL_NAME,
  description: "Track your working hours and overtime.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100">
        <NextIntlClientProvider messages={messages}>
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
      </body>
    </html>
  );
}
