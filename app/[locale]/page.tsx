import { BookOpen, ChevronRight, Clock3, FilePlus2, History, Sparkles, Trash2 } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { listQuizzes, deleteQuiz } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/navigation";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [quizzes, t, tNav] = await Promise.all([
    listQuizzes(),
    getTranslations("HomePage"),
    getTranslations("Nav"),
  ]);
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles data-icon="inline-start" />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-wide">{tNav("brandName")}</span>
              <span className="block text-xs text-muted-foreground">{tNav("brandTagline")}</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/results" />}
            >
              <History data-icon="inline-start" />
              {tNav("pastResults")}
            </Button>
            <Button size="sm" nativeButton={false} render={<Link href="/import" />}>
              <FilePlus2 data-icon="inline-start" />
              {tNav("addQuiz")}
            </Button>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <section className="grid gap-8 rounded-[2rem] bg-primary p-7 text-primary-foreground shadow-sm md:grid-cols-[1.3fr_.7fr] md:p-10">
          <div>
            <p className="text-sm font-semibold opacity-80">{t("heroLabel")}</p>
            <h1 className="mt-3 max-w-xl text-balance text-3xl font-bold leading-tight sm:text-5xl">
              {t("heroTitleLine1")}
              <br />
              {t("heroTitleLine2")}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-6 opacity-85">{t("heroDescription")}</p>
            <Button
              className="mt-7 bg-background text-foreground hover:bg-background/90"
              nativeButton={false}
              render={<Link href={quizzes[0] ? `/quiz/${quizzes[0].id}` : "/import"} />}
            >
              {t("startCta")}
              <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
          <div className="flex items-end justify-end">
            <div className="w-full max-w-xs rounded-3xl bg-background/15 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <BookOpen className="opacity-80" />
                <span className="rounded-full bg-background/20 px-3 py-1 text-xs">
                  {t("statusBadge")}
                </span>
              </div>
              <p className="mt-12 text-2xl font-bold">
                {t("quizCount", { count: quizzes.length })}
              </p>
              <p className="mt-1 text-sm opacity-75">{t("pacingNote")}</p>
            </div>
          </div>
        </section>
        <div className="mt-12 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">{t("libraryLabel")}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{t("libraryTitle")}</h2>
          </div>
          <Button variant="outline" nativeButton={false} render={<Link href="/import" />}>
            <FilePlus2 data-icon="inline-start" />
            {t("addFromJson")}
          </Button>
        </div>
        <section className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <article
              key={quiz.id}
              className="group flex flex-col rounded-3xl border bg-card p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                  {quiz.subject}
                </span>
                {quiz.id !== "sample" && (
                  <form
                    action={async () => {
                      "use server";
                      await deleteQuiz(locale, quiz.id);
                    }}
                  >
                    <button
                      aria-label={t("deleteAria", { title: quiz.title })}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 data-icon="inline-start" />
                    </button>
                  </form>
                )}
              </div>
              <h3 className="mt-5 text-xl font-bold leading-snug">{quiz.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                {quiz.description}
              </p>
              <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                <span>{quiz.topic}</span>
                <span className="flex items-center gap-1">
                  <Clock3 data-icon="inline-start" />
                  {t("questionCount", { count: quiz.questionCount })}
                </span>
              </div>
              <Button
                className="mt-6 w-full"
                variant="secondary"
                nativeButton={false}
                render={<Link href={`/quiz/${quiz.id}`} />}
              >
                {t("startQuiz")}
                <ChevronRight data-icon="inline-end" />
              </Button>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
