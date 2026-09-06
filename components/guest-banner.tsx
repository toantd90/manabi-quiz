import { CircleAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { signIn } from "@/auth";
import { resolveLocale } from "@/i18n/routing";

export async function GuestBanner({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: resolveLocale(locale), namespace: "AuthGate" });
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900 sm:text-sm">
      <span className="flex items-center gap-1.5">
        <CircleAlert className="size-4 shrink-0" />
        {t("guestBannerMessage")}
      </span>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: `/${locale}` });
        }}
      >
        <button type="submit" className="underline underline-offset-2">
          {t("guestBannerSignIn")}
        </button>
      </form>
    </div>
  );
}
