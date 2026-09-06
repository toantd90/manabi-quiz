"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { PartyPopper } from "lucide-react";
import { THEME_COOKIE } from "@/lib/theme";

export function ThemeToggle() {
  const t = useTranslations("Nav");
  const router = useRouter();

  function handleToggle() {
    // read the live DOM state set by the server layout instead of tracking React state,
    // so this works the same whether the toggle renders in a server or client page
    const isKids = document.documentElement.classList.contains("kids");
    const next = isKids ? "default" : "kids";
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={t("kidsTheme")}
      aria-label={t("kidsTheme")}
      className="flex size-8 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-muted hover:text-foreground kids:border-primary kids:bg-primary kids:text-primary-foreground kids:hover:bg-primary/90"
    >
      <PartyPopper className="size-4" />
    </button>
  );
}
