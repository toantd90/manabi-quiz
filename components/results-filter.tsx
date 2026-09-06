"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

type Attempt = {
  id: string;
  quizId: string;
  userId: string | null;
  quizTitleSnapshot: string;
  score: string;
  maxScore: string;
  correctCount: number;
  totalCount: number;
  accuracy: string;
  durationSeconds: number;
  completedAt: Date | string;
};

const PASS_THRESHOLD = 80;
type StatusFilter = "all" | "passed" | "needsReview";
type OwnerFilter = "all" | "mine";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function ResultsFilter({
  attempts,
  locale,
  currentUserId,
}: {
  attempts: Attempt[];
  locale: string;
  currentUserId: string;
}) {
  const t = useTranslations("ResultsPage");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [owner, setOwner] = useState<OwnerFilter>("all");
  const [page, setPage] = useState(1);
  const mineCount = attempts.filter((attempt) => attempt.userId === currentUserId).length;
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }),
    [locale],
  );
  const filtered = attempts.filter((attempt) => {
    const matchesSearch = attempt.quizTitleSnapshot
      .toLowerCase()
      .includes(search.trim().toLowerCase());
    const passed = Number(attempt.accuracy) >= PASS_THRESHOLD;
    const matchesStatus = status === "all" || (status === "passed" ? passed : !passed);
    const matchesOwner = owner === "all" || attempt.userId === currentUserId;
    return matchesSearch && matchesStatus && matchesOwner;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  return (
    <>
      <div className="mt-6 inline-flex rounded-full border bg-card p-1 text-sm">
        {(["all", "mine"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              setOwner(option);
              setPage(1);
            }}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-semibold transition",
              owner === option
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option === "all"
              ? t("filterAll", { count: attempts.length })
              : t("filterMine", { count: mineCount })}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-xl border bg-card pr-3.5 pl-9.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as StatusFilter);
            setPage(1);
          }}
          className="h-10 rounded-xl border bg-card px-3.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="all">{t("statusAll")}</option>
          <option value="passed">{t("statusPassed")}</option>
          <option value="needsReview">{t("statusNeedsReview")}</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">{t("noFilterResults")}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {paginated.map((attempt) => (
            <li key={attempt.id} className="rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-bold leading-snug">{attempt.quizTitleSnapshot}</h2>
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
                <span
                  className={cn(
                    Number(attempt.accuracy) >= PASS_THRESHOLD
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {t("accuracyValue", { value: attempt.accuracy })}
                </span>
                <span>{t("durationValue", { time: formatDuration(attempt.durationSeconds) })}</span>
              </div>
            </li>
          ))}
        </ul>
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
