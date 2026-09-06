"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { KIDS_PALETTE_COOKIE, KIDS_PALETTES } from "@/lib/theme";
import { cn } from "@/lib/utils";

// swatch fill matches each palette's --primary token, kept in sync manually with app/globals.css
const swatchStyles: Record<(typeof KIDS_PALETTES)[number], string> = {
  orange: "bg-[oklch(0.72_0.19_55)] kids-orange:ring-2",
  blue: "bg-[oklch(0.72_0.19_230)] kids-blue:ring-2",
  pink: "bg-[oklch(0.72_0.19_350)] kids-pink:ring-2",
  green: "bg-[oklch(0.72_0.19_145)] kids-green:ring-2",
  purple: "bg-[oklch(0.72_0.19_300)] kids-purple:ring-2",
};

// hidden outside the kids theme; only relevant once the kids class is on <html>
export function PaletteSwatches() {
  const t = useTranslations("Nav");
  const router = useRouter();

  return (
    <fieldset
      className="hidden items-center gap-1 border-0 p-0 kids:flex"
      aria-label={t("kidsPalette")}
    >
      {KIDS_PALETTES.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            document.cookie = `${KIDS_PALETTE_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
            router.refresh();
          }}
          aria-label={id}
          className={cn(
            "size-5 rounded-full ring-foreground ring-offset-2 ring-offset-background transition",
            swatchStyles[id],
          )}
        />
      ))}
    </fieldset>
  );
}
