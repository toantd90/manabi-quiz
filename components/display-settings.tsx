"use client";

import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { PaletteSwatches } from "@/components/palette-swatches";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// bundles language/theme/palette controls; inline from sm up, collapsed into a popover below that
export function DisplaySettings() {
  const t = useTranslations("Nav");

  return (
    <>
      <div className="hidden items-center gap-2 sm:flex">
        <LanguageSwitcher />
        <ThemeToggle />
        <PaletteSwatches />
      </div>
      <Popover>
        <PopoverTrigger
          aria-label={t("displaySettings")}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-muted hover:text-foreground sm:hidden"
        >
          <Settings2 className="size-4" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto sm:hidden">
          <div className="flex flex-col items-start gap-3 p-1">
            <LanguageSwitcher />
            <ThemeToggle />
            <PaletteSwatches />
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
