import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Apenas continua a execução, já que o idioma é tratado no src/i18n/request.ts
  // e no RootLayout. Isso evita que o next-intl tente reescrever rotas
  // para pastas [locale] que não existem na sua estrutura.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|_static|_vercel|[\\w-]+\\.\\w+).*)"],
};
