import { ArrowLeft, Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { auth, signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ImportForm } from "@/components/import-form";
import { UserMenu } from "@/components/user-menu";
import { Link } from "@/i18n/navigation";

export default async function ImportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) {
    const [t, tNav, tAuth] = await Promise.all([
      getTranslations("ImportPage"),
      getTranslations("Nav"),
      getTranslations("AuthGate"),
    ]);
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-5 sm:py-10">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeft data-icon="inline-start" />
              {tNav("backToList")}
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu locale={locale} />
            </div>
          </div>
          <section className="mt-10 rounded-[2rem] border bg-card p-6 text-center shadow-sm sm:p-8">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary">
              <Lock data-icon="inline-start" />
            </span>
            <h1 className="mt-5 text-2xl font-bold">{t("signInRequiredTitle")}</h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              {t("signInRequiredDescription")}
            </p>
            <form
              className="mt-6 flex justify-center"
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: `/${locale}/import` });
              }}
            >
              <Button type="submit">{tAuth("signInCta")}</Button>
            </form>
          </section>
        </div>
      </main>
    );
  }
  return <ImportForm userMenu={<UserMenu locale={locale} />} />;
}
