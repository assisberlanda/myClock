export type LegalContentSlug = "sobre" | "funciona" | "politica" | "termo";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTitleKey(key: string): string {
  if (key === "titulo") return "#";
  if (key.startsWith("secao")) return "##";
  if (key === "importante") return "##";
  if (key === "versao") return "##";
  if (key === "suporte") return "##";
  return "##";
}

function appendObject(node: Record<string, unknown>, keyHint: string, lines: string[]): void {
  const title = typeof node.titulo === "string" ? node.titulo : null;

  if (title) {
    lines.push(`${normalizeTitleKey(keyHint)} ${title}`);
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === "titulo") continue;

    if (typeof value === "string") {
      if (value.trim()) {
        lines.push(value);
      }
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.trim()) {
          lines.push(`- ${item}`);
        }
      }
      continue;
    }

    if (isPlainObject(value)) {
      appendObject(value, key, lines);
    }
  }
}

function jsonToText(json: unknown): string {
  if (!isPlainObject(json)) return "";

  const rootValue = Object.values(json)[0];
  if (!isPlainObject(rootValue)) return "";

  const lines: string[] = [];
  appendObject(rootValue, "titulo", lines);

  return lines.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function loadLegalContent(locale: string, slug: LegalContentSlug): Promise<string> {
  const primaryPath = `/locales/${locale}/${slug}-${locale}.json`;
  const fallbackLocale = "pt";
  const fallbackPath = `/locales/${fallbackLocale}/${slug}-${fallbackLocale}.json`;

  try {
    const response = await fetch(primaryPath);
    if (response.ok) {
      return jsonToText(await response.json());
    }
  } catch {
    // Keep silent and continue to fallback.
  }

  try {
    const response = await fetch(fallbackPath);
    if (response.ok) {
      return jsonToText(await response.json());
    }
  } catch {
    // Return empty string if fallback also fails.
  }

  return "";
}
