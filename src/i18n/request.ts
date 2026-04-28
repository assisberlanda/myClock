import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import {
  APP_I18N_LANGUAGES,
  DEFAULT_LANGUAGE,
} from "@/shared/i18n/config";

const APP_LANGUAGE_SET = new Set<string>(APP_I18N_LANGUAGES as string[]);

function detectLanguageFromAcceptLanguage(
  acceptLanguageHeader: string | null
): string {
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
      : APP_LANGUAGE_SET.has(browserLocale)
      ? browserLocale
      : DEFAULT_LANGUAGE;

  let messages: Record<string, unknown>;

  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    // fallback seguro (garante que nunca quebra build)
    messages = (await import(`../../messages/${DEFAULT_LANGUAGE}.json`)).default;
  }

  return {
    locale,
    messages,
  };
});