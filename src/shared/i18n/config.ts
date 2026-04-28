export const DEFAULT_LANGUAGE = "en";
export const DEFAULT_CURRENCY = "EUR";
export const APP_I18N_LANGUAGES = ["en", "pt", "ga", "lt", "ru", "uk", "ro", "es", "bg", "lv", "ur"] as const;

export const LANGUAGE_TO_LOCALE: Record<string, string> = {
  en: "en-IE",
  pt: "pt-PT",
  ga: "ga-IE",
  lt: "lt-LT",
  ru: "ru-RU",
  uk: "uk-UA",
  ro: "ro-RO",
  es: "es-ES",
  bg: "bg-BG",
  lv: "lv-LV",
  ur: "ur-PK",
};
