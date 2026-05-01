import { getRequestConfig } from "next-intl/server";
import {
  APP_I18N_LANGUAGES,
  DEFAULT_LANGUAGE,
} from "@/shared/i18n/config";

const APP_LANGUAGE_SET = new Set<string>(APP_I18N_LANGUAGES);

export default getRequestConfig(async ({ locale }) => {
  // Await locale as it's a promise in Next.js 15+
  const currentLocale = (await locale) || DEFAULT_LANGUAGE;
  
  // Validate that the incoming `locale` parameter is valid
  let finalLocale = currentLocale;
  if (!APP_I18N_LANGUAGES.includes(currentLocale as any)) {
    finalLocale = DEFAULT_LANGUAGE;
  }

  let messages: Record<string, unknown>;
  try {
    // Try to load the requested locale
    messages = (await import(`../../messages/${finalLocale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale "${finalLocale}":`, error);
    try {
      // Fallback to default language
      messages = (await import(`../../messages/${DEFAULT_LANGUAGE}.json`)).default;
    } catch (fallbackError) {
      console.error(`Failed to load fallback messages for locale "${DEFAULT_LANGUAGE}":`, fallbackError);
      messages = {}; // Last resort fallback
    }
  }

  return {
    locale: finalLocale,
    messages,
  };
});