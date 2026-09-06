import { ArrowLeft, History } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { listAttempts } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function ResultsPage() {
  const [t, tNav, locale, attempts] = await Promise.all([
    getTranslations("ResultsPage"),
    getTranslations("Nav"),
    getLocale(),
    listAttempts(),
  ]);
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          {tNav("backToList")}
        </Link>
        {attempts.length === 0 ? (
          <section className="mt-10 rounded-[2rem] border bg-card p-8 text-center shadow-sm">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-secondary">
              <History data-icon="inline-start" />
            </span>
            <h1 className="mt-5 text-2xl font-bold">{t("title")}</h1>
            <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">
              {t("description")}
            </p>
            <Button className="mt-6">
              <Link href="/">{t("browseQuizzes")}</Link>
            </Button>
          </section>
        ) : (
          <section className="mt-10">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <ul className="mt-6 flex flex-col gap-4">
              {attempts.map((attempt) => (
                <li
                  key={attempt.id}
                  className="rounded-3xl border bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-bold leading-snug">
                      {attempt.quizTitleSnapshot}
                    </h2>
                    <Link
                      href={`/quiz/${attempt.quizId}`}
                      className="text-sm font-semibold text-primary"
                    >
                      {t("retryQuiz")}
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {dateFormatter.format(new Date(attempt.completedAt))}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-6 text-sm">
                    <span>
                      {t("scoreValue", {
                        score: attempt.score,
                        maxScore: attempt.maxScore,
                      })}
                    </span>
                    <span>
                      {t("correctCountValue", {
                        count: attempt.correctCount,
                        total: attempt.totalCount,
                      })}
                    </span>
                    <span>{t("accuracyValue", { value: attempt.accuracy })}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}


