import { BookOpen, ChevronRight, FilePlus2, History, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { listQuizzes } from "@/app/actions/quiz";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { QuizLibrary } from "@/components/quiz-library";
import { UserMenu } from "@/components/user-menu";
import { Link } from "@/i18n/navigation";

// quiz list changes on import/delete; avoid serving a stale build-time cache
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [quizzes, t, tNav, session] = await Promise.all([
    listQuizzes(),
    getTranslations("HomePage"),
    getTranslations("Nav"),
    auth(),
  ]);
  const canAddQuiz = Boolean(session?.user);
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-card/80">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4 sm:px-5 sm:py-5">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Sparkles data-icon="inline-start" />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-wide">{tNav("brandName")}</span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                {tNav("brandTagline")}
              </span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/results" />}
            >
              <History data-icon="inline-start" />
              <span className="hidden sm:inline">{tNav("pastResults")}</span>
            </Button>
            {canAddQuiz && (
              <Button size="sm" nativeButton={false} render={<Link href="/import" />}>
                <FilePlus2 data-icon="inline-start" />
                <span className="hidden sm:inline">{tNav("addQuiz")}</span>
              </Button>
            )}
            <ThemeToggle />
            <UserMenu locale={locale} />
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-10">
        <section className="grid gap-6 rounded-[2rem] bg-primary p-5 text-primary-foreground shadow-sm sm:gap-8 sm:p-7 md:grid-cols-[1.3fr_.7fr] md:p-10">
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
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4 sm:mt-12">
          <div>
            <p className="text-sm font-semibold text-primary">{t("libraryLabel")}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight">{t("libraryTitle")}</h2>
          </div>
          {canAddQuiz && (
            <Button variant="outline" nativeButton={false} render={<Link href="/import" />}>
              <FilePlus2 data-icon="inline-start" />
              {t("addFromJson")}
            </Button>
          )}
        </div>
        <QuizLibrary
          quizzes={quizzes}
          locale={locale}
          currentUserId={session?.user?.id ?? null}
        />
      </div>
    </main>
  );
}
