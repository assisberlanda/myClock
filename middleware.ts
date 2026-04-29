import createMiddleware from "next-intl/middleware";

const APP_I18N_LANGUAGES = ["en", "pt", "ga", "lt", "ru", "uk", "ro", "es", "bg", "lv", "ur"] as const;
const DEFAULT_LANGUAGE = "en";

const intlMiddleware = createMiddleware({
  locales: APP_I18N_LANGUAGES,
  defaultLocale: DEFAULT_LANGUAGE,
  localePrefix: "never",
});

export default intlMiddleware;

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};