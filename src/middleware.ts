import createMiddleware from 'next-intl/middleware';
import { APP_I18N_LANGUAGES, DEFAULT_LANGUAGE } from './shared/i18n/config';

export default createMiddleware({
  locales: APP_I18N_LANGUAGES,
  defaultLocale: DEFAULT_LANGUAGE,
  localePrefix: 'as-needed'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};