"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Clock, History, Settings, HelpCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function TopNav() {
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
    <nav className="hidden md:flex items-center gap-2">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
              isActive
                ? "bg-action-primary text-text-on-brand"
                : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

