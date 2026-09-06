import { hasLocale } from "next-intl";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ja", "en", "vi"],
  defaultLocale: "ja",
});

// narrows an arbitrary locale string to a supported one, e.g. for getTranslations()
export function resolveLocale(locale: string) {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}
