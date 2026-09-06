"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { deleteQuiz } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

type QuizListItem = {
  id: string;
  title: string;
  subject: string;
  topic: string;
  description: string | null;
  importedBy: string | null;
  questionCount: number;
};

type Filter = "all" | "mine";

export function QuizLibrary({
  quizzes,
  locale,
  currentUserId,
}: {
  quizzes: QuizListItem[];
  locale: string;
  currentUserId: string | null;
}) {
  const t = useTranslations("HomePage");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const mineCount = currentUserId
    ? quizzes.filter((quiz) => quiz.importedBy === currentUserId).length
    : 0;
  const filtered =
    currentUserId && filter === "mine"
      ? quizzes.filter((quiz) => quiz.importedBy === currentUserId)
      : quizzes;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return (
    <>
      {currentUserId && (
        <div className="mt-5 inline-flex rounded-full border bg-card p-1 text-sm">
          {(["all", "mine"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setFilter(option);
                setPage(1);
              }}
              className={cn(
                "rounded-full px-3.5 py-1.5 font-semibold transition",
                filter === option
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option === "all"
                ? t("filterAll", { count: quizzes.length })
                : t("filterMine", { count: mineCount })}
            </button>
          ))}
        </div>
      )}
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">{t("noMineQuizzes")}</p>
      ) : (
        <section className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginated.map((quiz) => (
            <article
              key={quiz.id}
              className="group flex flex-col rounded-3xl border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold">
                  {quiz.subject}
                </span>
                {quiz.id !== "sample" && quiz.importedBy === currentUserId && (
                  <form
                    action={async () => {
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
      )}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("paginationPrevious")}
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft />
          </Button>
          <span className="text-sm text-muted-foreground">
            {t("paginationPage", { current: currentPage, total: totalPages })}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={t("paginationNext")}
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </>
  );
}
