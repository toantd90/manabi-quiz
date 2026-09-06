import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Baloo_2 } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { THEME_COOKIE, resolveTheme, KIDS_PALETTE_COOKIE, resolveKidsPalette } from "@/lib/theme";
import { cn } from "@/lib/utils";
import "../globals.css";

const kidsFont = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-kids",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f7faf8",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value);
  const kidsPalette = resolveKidsPalette(cookieStore.get(KIDS_PALETTE_COOKIE)?.value);
  return (
    <html
      lang={locale}
      className={cn("bg-background", theme === "kids" && "kids")}
      data-kids-palette={kidsPalette}
    >
      <body className={cn(kidsFont.variable, "antialiased")}>
        <NextIntlClientProvider>
          {children}
          {process.env.NODE_ENV === "production" && <Analytics />}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
