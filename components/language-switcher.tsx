"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeLabels: Record<(typeof routing.locales)[number], string> = {
  ja: "日本語",
  en: "English",
  vi: "Tiếng Việt",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(nextLocale: (typeof routing.locales)[number]) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-full border bg-background p-1 text-xs font-semibold">
      {routing.locales.map((cur) => (
        <button
          key={cur}
          type="button"
          disabled={isPending || cur === locale}
          onClick={() => handleChange(cur)}
          aria-current={cur === locale ? "true" : undefined}
          className={cn(
            "rounded-full px-2.5 py-1 transition disabled:cursor-default",
            cur === locale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {localeLabels[cur]}
        </button>
      ))}
    </div>
  );
}
