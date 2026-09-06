import { LogIn, LogOut } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { auth, signIn, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export async function UserMenu({ locale }: { locale: string }) {
  const [session, t] = await Promise.all([auth(), getTranslations("Nav")]);

  if (!session?.user) {
    return (
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: `/${locale}` });
        }}
      >
        <Button variant="outline" size="sm" type="submit">
          <LogIn data-icon="inline-start" />
          <span className="hidden sm:inline">{t("signIn")}</span>
        </Button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {session.user.image ? (
        <Image
          src={session.user.image}
          alt=""
          width={32}
          height={32}
          referrerPolicy="no-referrer"
          className="size-8 shrink-0 rounded-full"
        />
      ) : null}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: `/${locale}` });
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          type="submit"
          aria-label={t("signOut")}
          title={t("signOut")}
          className="rounded-full"
        >
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}
