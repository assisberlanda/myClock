import createMiddleware from "next-intl/middleware";
import { APP_I18N_LANGUAGES, DEFAULT_LANGUAGE } from "@/shared/i18n/config";

const intlMiddleware = createMiddleware({
  locales: APP_I18N_LANGUAGES,
  defaultLocale: DEFAULT_LANGUAGE,
  localePrefix: "never",
});

export default intlMiddleware;

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
