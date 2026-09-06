"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Attempt = {
  id: string;
  quizId: string;
  quizTitleSnapshot: string;
  score: string;
  maxScore: string;
  correctCount: number;
  totalCount: number;
  accuracy: string;
  completedAt: Date | string;
};

const PASS_THRESHOLD = 80;
type StatusFilter = "all" | "passed" | "needsReview";

export function ResultsFilter({ attempts, locale }: { attempts: Attempt[]; locale: string }) {
  const t = useTranslations("ResultsPage");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
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
    return matchesSearch && matchesStatus;
  });
  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-xl border bg-card pr-3.5 pl-9.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
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
          {filtered.map((attempt) => (
            <li key={attempt.id} className="rounded-3xl border bg-card p-6 shadow-sm">
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
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
