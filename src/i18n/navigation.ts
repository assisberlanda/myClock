import { createNavigation } from 'next-intl/navigation';
import { APP_I18N_LANGUAGES } from '@/shared/i18n/config';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales: APP_I18N_LANGUAGES });
