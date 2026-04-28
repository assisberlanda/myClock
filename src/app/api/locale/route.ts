import { NextResponse } from "next/server";
import { APP_I18N_LANGUAGES, DEFAULT_LANGUAGE } from "@/shared/i18n/config";

const APP_LANGUAGE_SET = new Set<string>(APP_I18N_LANGUAGES);

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { locale?: string } | null;
  const locale = body?.locale && APP_LANGUAGE_SET.has(body.locale) ? body.locale : DEFAULT_LANGUAGE;

  const response = NextResponse.json({ ok: true });
  response.cookies.set("NEXT_LOCALE", locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return response;
}
