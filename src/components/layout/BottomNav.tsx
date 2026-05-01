"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Home, Clock, History, Settings, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("Navigation");

  const items = [
    { name: t("dashboard"), href: "/", icon: Home },
    { name: t("clock"), href: "/clock", icon: Clock },
    { name: t("history"), href: "/history", icon: History },
    { name: t("howItWorks"), href: "/how-it-works", icon: HelpCircle },
    { name: t("about"), href: "/about", icon: Info },
    { name: "", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 pb-safe md:hidden">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-blue-600 dark:text-blue-500"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              )}
            >
              <item.icon
                className={cn(
                  "w-6 h-6",
                  isActive && "fill-current opacity-20"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="truncate max-w-full px-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
