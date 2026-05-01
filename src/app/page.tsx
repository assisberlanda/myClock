import { redirect } from 'next/navigation';
import { DEFAULT_LANGUAGE } from '@/shared/i18n/config';

export default function RootPage() {
  redirect(`/${DEFAULT_LANGUAGE}`);
}
