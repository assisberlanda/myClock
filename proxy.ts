import createMiddleware from "next-intl/middleware";
import { APP_I18N_LANGUAGES, DEFAULT_LANGUAGE } from "@/shared/i18n/config";

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: APP_I18N_LANGUAGES,

  // Used when no locale matches
  defaultLocale: DEFAULT_LANGUAGE,

  // If this is set to 'never', the locale won't be prefixed in the URL
  localePrefix: "never",
});

// Next.js 16 requires a named export 'proxy' or default export.
export function proxy(request: any) {
  return intlMiddleware(request);
}

// Providing both to be safe
export default proxy;

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (internal paths)
    // - _static (inside /public)
    // - _vercel (internal paths)
    // - all files (e.g. favicon.ico, logo.png)
    "/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};
