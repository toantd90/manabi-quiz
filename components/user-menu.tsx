import { LogIn, LogOut, User } from "lucide-react";
import Image from "next/image";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PaletteSwatches } from "@/components/palette-swatches";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { THEME_COOKIE, resolveTheme } from "@/lib/theme";

// avatar/profile trigger bundles display settings + auth so the header only
// needs one icon for account-related actions
export async function UserMenu({ locale }: { locale: string }) {
  const [session, t, cookieStore] = await Promise.all([
    auth(),
    getTranslations("Nav"),
    cookies(),
  ]);
  const isKidsTheme = resolveTheme(cookieStore.get(THEME_COOKIE)?.value) === "kids";

  return (
    <Popover>
      <PopoverTrigger
        aria-label={t("accountMenu")}
        className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={32}
            height={32}
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        ) : (
          <User className="size-4" />
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        {session?.user && (
          <div className="flex items-center gap-3 border-b p-3">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt=""
                width={36}
                height={36}
                referrerPolicy="no-referrer"
                className="size-9 shrink-0 rounded-full"
              />
            ) : (
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="size-4 text-muted-foreground" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{session.user.name}</p>
              {session.user.email && (
                <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
              )}
            </div>
          </div>
        )}
        <div className="flex flex-col divide-y p-1">
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t("languageLabel")}
            </span>
            <LanguageSwitcher />
          </div>
          {isKidsTheme && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2">
              <span className="text-sm font-medium text-muted-foreground">
                {t("paletteLabel")}
              </span>
              <PaletteSwatches />
            </div>
          )}
        </div>
        <div className="border-t p-1">
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: `/${locale}` });
              }}
            >
              <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
                <LogOut data-icon="inline-start" />
                {t("signOut")}
              </Button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: `/${locale}` });
              }}
            >
              <Button variant="outline" size="sm" type="submit" className="w-full justify-start">
                <LogIn data-icon="inline-start" />
                {t("signIn")}
              </Button>
            </form>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
