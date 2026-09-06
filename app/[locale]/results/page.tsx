import { ArrowLeft, History } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { listAttempts } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { DisplaySettings } from "@/components/display-settings";
import { ResultsFilter } from "@/components/results-filter";
import { UserMenu } from "@/components/user-menu";
import { Link } from "@/i18n/navigation";

// attempt history changes after every submission; avoid serving a stale build-time cache
export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const [t, tNav, locale, attempts] = await Promise.all([
    getTranslations("ResultsPage"),
    getTranslations("Nav"),
    getLocale(),
    listAttempts(),
  ]);
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-5 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft data-icon="inline-start" />
            {tNav("backToList")}
          </Link>
          <div className="flex items-center gap-2">
            <DisplaySettings />
            <UserMenu locale={locale} />
          </div>
        </div>
        {attempts.length === 0 ? (
          <section className="mt-10 rounded-[2rem] border bg-card p-6 text-center shadow-sm sm:p-8">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary">
              <History data-icon="inline-start" />
            </span>
            <h1 className="mt-5 text-2xl font-bold">{t("title")}</h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              {t("description")}
            </p>
            <Button className="mt-6" nativeButton={false} render={<Link href="/" />}>
              {t("browseQuizzes")}
            </Button>
          </section>
        ) : (
          <section className="mt-10">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <ResultsFilter attempts={attempts} locale={locale} />
          </section>
        )}
      </div>
    </main>
  );
}
