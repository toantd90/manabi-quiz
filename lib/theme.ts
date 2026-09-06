export const THEME_COOKIE = "manabi-theme";
export const THEMES = ["default", "kids"] as const;
export type Theme = (typeof THEMES)[number];

export function resolveTheme(value: string | undefined): Theme {
  return THEMES.includes(value as Theme) ? (value as Theme) : "default";
}

export const KIDS_PALETTE_COOKIE = "manabi-kids-palette";
export const KIDS_PALETTES = ["orange", "blue", "pink", "green", "purple"] as const;
export type KidsPalette = (typeof KIDS_PALETTES)[number];

export function resolveKidsPalette(value: string | undefined): KidsPalette {
  return KIDS_PALETTES.includes(value as KidsPalette) ? (value as KidsPalette) : "orange";
}
