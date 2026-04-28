import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import {
  APP_I18N_LANGUAGES,
  DEFAULT_LANGUAGE,
} from "@/shared/i18n/config";

const APP_LANGUAGE_SET = new Set<string>(APP_I18N_LANGUAGES);

function detectLanguage(
  cookieLocale: string | undefined,
  acceptLanguage: string | null
): string {
  // 1. Priority: Cookie set by middleware or our API
  if (cookieLocale && APP_LANGUAGE_SET.has(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Priority: Accept-Language header
  if (acceptLanguage) {
    const candidates = acceptLanguage
      .split(",")
      .map((part) => part.split(";")[0]?.trim().toLowerCase())
      .filter(Boolean);

    for (const candidate of candidates) {
      if (APP_LANGUAGE_SET.has(candidate)) return candidate;
      const base = candidate.split("-")[0];
      if (base && APP_LANGUAGE_SET.has(base)) return base;
    }
  }

  // 3. Fallback
  return DEFAULT_LANGUAGE;
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const requestHeaders = await headers();

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const acceptLanguage = requestHeaders.get("accept-language");

  const locale = detectLanguage(cookieLocale, acceptLanguage);

  let messages: Record<string, unknown>;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale "${locale}":`, error);
    messages = (await import(`../../messages/${DEFAULT_LANGUAGE}.json`)).default;
  }

  return {
    locale,
    messages,
  };
});