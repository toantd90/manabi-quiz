"use client";

import { Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PaletteSwatches } from "@/components/palette-swatches";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// language + palette live behind a single icon at every breakpoint so the header
// stays compact; theme has its own quick toggle since it's used more often
export function DisplaySettings() {
  const t = useTranslations("Nav");

  return (
    <Popover>
      <PopoverTrigger
        aria-label={t("displaySettings")}
        className="flex size-8 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Settings2 className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto">
        <div className="flex flex-col items-start gap-3 p-1">
          <LanguageSwitcher />
          <PaletteSwatches />
        </div>
      </PopoverContent>
    </Popover>
  );
}
