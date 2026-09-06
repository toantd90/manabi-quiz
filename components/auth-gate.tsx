import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { continueAsGuest } from "@/app/actions/guest";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { GuestBanner } from "@/components/guest-banner";
import { resolveLocale } from "@/i18n/routing";
import { GUEST_COOKIE } from "@/lib/guest";

export async function AuthGate({ locale, children }: { locale: string; children: ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isGuest = cookieStore.get(GUEST_COOKIE)?.value === "1";

  if (!session?.user && !isGuest) {
    const t = await getTranslations({ locale: resolveLocale(locale), namespace: "AuthGate" });
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <section className="w-full max-w-sm rounded-[2rem] border bg-card p-6 text-center shadow-sm sm:p-8">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles data-icon="inline-start" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-3 leading-6 text-muted-foreground">{t("description")}</p>
          <form
            className="mt-6"
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: `/${locale}` });
            }}
          >
            <Button type="submit" className="w-full">
              {t("signInCta")}
            </Button>
          </form>
          <form className="mt-3" action={continueAsGuest}>
            <Button type="submit" variant="ghost" className="w-full">
              {t("continueGuestCta")}
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">{t("guestWarning")}</p>
        </section>
      </main>
    );
  }

  return (
    <>
      {!session?.user && <GuestBanner locale={locale} />}
      {children}
    </>
  );
}
