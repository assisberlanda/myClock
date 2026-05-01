"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { APP_I18N_LANGUAGES } from "@/shared/i18n/config";

export function LanguageSwitcher() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLocaleChange = (nextLocale: string) => {
    if (!nextLocale || nextLocale === locale) return;

    setIsUpdating(true);
    try {
      // Muda a URL para o novo idioma mantendo o mesmo path
      // O next-intl/navigation cuida de atualizar o cookie NEXT_LOCALE automaticamente
      router.replace(pathname, { locale: nextLocale });
    } catch (error) {
      console.error("Failed to change locale:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-text-secondary">{t("language")}</span>
      <select
        className="h-8 rounded-md border border-border-default bg-surface-card px-2 text-xs font-semibold text-text-primary"
        value={locale}
        onChange={(event) => void handleLocaleChange(event.target.value)}
        disabled={isUpdating}
        aria-label={t("language")}
        suppressHydrationWarning
      >
        {APP_I18N_LANGUAGES.map((languageCode) => (
          <option key={languageCode} value={languageCode}>
            {languageCode === 'pt' ? 'Português' :
             languageCode === 'ga' ? 'Gaeilge' :
             languageCode === 'en' ? 'English' :
             languageCode === 'lt' ? 'Lietuvių' :
             languageCode === 'ru' ? 'Русский' :
             languageCode === 'uk' ? 'Українська' :
             languageCode === 'ro' ? 'Română' :
             languageCode === 'es' ? 'Español' :
             languageCode === 'bg' ? 'Български' :
             languageCode === 'lv' ? 'Latviešu' :
             languageCode === 'ur' ? 'اردو' :
             languageCode}
          </option>
        ))}
      </select>
    </div>
  );
}
