import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { APP_I18N_LANGUAGES, DEFAULT_LANGUAGE } from "@/shared/i18n/config";

const APP_LANGUAGE_SET = new Set(APP_I18N_LANGUAGES);

function detectLanguageFromAcceptLanguage(acceptLanguageHeader: string | null) {
  if (!acceptLanguageHeader) return DEFAULT_LANGUAGE;

  const candidates = acceptLanguageHeader
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const candidate of candidates) {
    if (APP_LANGUAGE_SET.has(candidate)) return candidate;

    const base = candidate.split("-")[0];
    if (base && APP_LANGUAGE_SET.has(base)) return base;
  }

  return DEFAULT_LANGUAGE;
}

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const requestHeaders = headers();

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  const acceptLanguage = requestHeaders.get("accept-language");

  const browserLocale = detectLanguageFromAcceptLanguage(acceptLanguage);

  const locale =
    cookieLocale && APP_LANGUAGE_SET.has(cookieLocale)
      ? cookieLocale
      : browserLocale;

  let messages: Record<string, unknown> = {};

  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../../messages/${DEFAULT_LANGUAGE}.json`)).default;
  }

  return {
    locale,
    messages,
  };
});