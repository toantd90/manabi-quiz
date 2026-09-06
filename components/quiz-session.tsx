"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Clock, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitAttempt } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { PaletteSwatches } from "@/components/palette-swatches";
import { Link } from "@/i18n/navigation";

const SECONDS_PER_QUESTION = 60;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

type Question = {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
  memoryTip?: string | null;
  points: number;
};
type Quiz = {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
};

// switching language mid-quiz remounts this component; progress is kept in sessionStorage keyed by quiz id
const storageKeyFor = (quizId: string) => `quiz-session-progress:${quizId}`;

type PersistedState = {
  questions: Question[];
  index: number;
  selected: string | null;
  answers: { questionId: string; selectedAnswer: string }[];
  timeLeft: number;
  result: Awaited<ReturnType<typeof submitAttempt>> | null;
  reviewMode: boolean;
  reviewIndex: number;
  reviewedIds: string[];
};

export function QuizSession({ quiz }: { quiz: Quiz }) {
  const t = useTranslations("QuizSession");
  const tNav = useTranslations("Nav");
  const storageKey = storageKeyFor(quiz.id);
  const [questions, setQuestions] = useState(() =>
    [...quiz.questions]
      .sort(() => Math.random() - 0.5)
      .map((q) => ({
        ...q,
        choices: [...q.choices].sort(() => Math.random() - 0.5),
      })),
  );
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; selectedAnswer: string }[]>([]);
  const [result, setResult] = useState<Awaited<ReturnType<typeof submitAttempt>> | null>(null);
  const totalSeconds = questions.length * SECONDS_PER_QUESTION;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const current = questions[index];
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // guards against duplicate submitAttempt calls from rapid clicks or a race with the timeout auto-submit
  const submittedRef = useRef(false);
  const mistakes = useMemo(
    () => (result ? result.scored.filter((item) => !item.isCorrect) : []),
    [result],
  );
  const clearProgress = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // storage may be unavailable (e.g. private browsing)
    }
  };

  // restore progress saved before a remount (e.g. a language switch) instead of resetting the session
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as PersistedState;
        if (saved.questions?.length) {
          setQuestions(saved.questions);
          setIndex(saved.index);
          setSelected(saved.selected);
          setAnswers(saved.answers);
          setTimeLeft(saved.timeLeft);
          setResult(saved.result);
          setReviewMode(saved.reviewMode);
          setReviewIndex(saved.reviewIndex);
          setReviewedIds(new Set(saved.reviewedIds));
        }
      }
    } catch {
      // ignore corrupt or unavailable storage
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: PersistedState = {
      questions,
      index,
      selected,
      answers,
      timeLeft,
      result,
      reviewMode,
      reviewIndex,
      reviewedIds: Array.from(reviewedIds),
    };
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      // storage may be unavailable (e.g. private browsing)
    }
  }, [
    hydrated,
    storageKey,
    questions,
    index,
    selected,
    answers,
    timeLeft,
    result,
    reviewMode,
    reviewIndex,
    reviewedIds,
  ]);

  // marks the mistake currently shown in review mode as reviewed
  useEffect(() => {
    if (!reviewMode) return;
    const questionId = mistakes[reviewIndex]?.question.id;
    if (!questionId || reviewedIds.has(questionId)) return;
    setReviewedIds((prev) => new Set(prev).add(questionId));
  }, [reviewMode, reviewIndex, mistakes, reviewedIds]);

  useEffect(() => {
    if (result || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [result, timeLeft]);

  useEffect(() => {
    if (result || timeLeft > 0 || submittedRef.current) return;
    submittedRef.current = true;
    const finalAnswers = selected ? [...answers, { questionId: current.id, selectedAnswer: selected }] : answers;
    void submitAttempt({
      quizId: quiz.id,
      answers: finalAnswers,
      durationSeconds: totalSeconds,
    })
      .then(setResult)
      .catch(() => {
        submittedRef.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, result]);

  if (result && reviewMode) {
    const total = mistakes.length;
    const reviewedCount = reviewedIds.size;
    const currentMistake = mistakes[reviewIndex];
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-5 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setReviewMode(false)}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft data-icon="inline-start" />
            {t("reviewBack")}
          </button>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <PaletteSwatches />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-primary">{t("reviewTitle")}</span>
            <span className="text-muted-foreground">
              {t("reviewQuestionCounter", { current: reviewIndex + 1, total })}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${total ? (reviewedCount / total) * 100 : 0}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-muted-foreground">
            {t("reviewProgress", { reviewed: reviewedCount, total })}
          </p>
        </div>
        {reviewedCount === total && total > 0 && (
          <div className="rounded-2xl border bg-primary/10 p-5 text-center font-bold text-primary">
            {t("reviewCompleted")}
          </div>
        )}
        {currentMistake && (
          <section className="rounded-[2rem] border bg-card p-5 shadow-sm sm:p-10">
            <p className="text-sm text-muted-foreground">{quiz.title}</p>
            <h1 className="mt-4 text-xl font-bold leading-relaxed sm:text-3xl">
              {currentMistake.question.question}
            </h1>
            <div className="mt-6 rounded-2xl border bg-destructive/10 p-5">
              <p className="font-bold">
                {t("reviewYourAnswer", { answer: currentMistake.selectedAnswer || "-" })}
              </p>
            </div>
            <div className="mt-3 rounded-2xl border bg-primary/10 p-5">
              <p className="font-bold">
                {t("reviewCorrectAnswer", { answer: currentMistake.question.correctAnswer })}
              </p>
              <p className="mt-2 text-sm leading-6">{currentMistake.question.explanation}</p>
              {currentMistake.question.memoryTip && (
                <p className="mt-3 text-sm font-semibold">
                  {t("memoryTip", { tip: currentMistake.question.memoryTip })}
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                variant="outline"
                disabled={reviewIndex === 0}
                onClick={() => setReviewIndex((i) => Math.max(0, i - 1))}
              >
                {t("reviewPrevious")}
              </Button>
              <Button
                disabled={reviewIndex === total - 1}
                onClick={() => setReviewIndex((i) => Math.min(total - 1, i + 1))}
              >
                {t("reviewNext")}
              </Button>
            </div>
          </section>
        )}
      </main>
    );
  }
  if (result)
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-5 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            onClick={clearProgress}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <ArrowLeft data-icon="inline-start" />
            {tNav("backToList")}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <PaletteSwatches />
          </div>
        </div>
        <section className="rounded-[2rem] border bg-card p-5 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-primary">{t("completedLabel")}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{result.quiz.title}</h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-secondary p-5">
              <p className="text-sm text-muted-foreground">{t("scoreLabel")}</p>
              <p className="mt-1 text-3xl font-bold">
                {t("scoreValue", {
                  score: result.score,
                  maxScore: result.maxScore,
                })}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary p-5">
              <p className="text-sm text-muted-foreground">{t("correctCountLabel")}</p>
              <p className="mt-1 text-3xl font-bold">
                {t("correctCountValue", { count: result.correctCount })}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary p-5">
              <p className="text-sm text-muted-foreground">{t("accuracyLabel")}</p>
              <p className="mt-1 text-3xl font-bold">
                {t("accuracyValue", { value: result.accuracy })}
              </p>
            </div>
            <div className="rounded-2xl bg-secondary p-5">
              <p className="text-sm text-muted-foreground">{t("durationLabel")}</p>
              <p className="mt-1 text-3xl font-bold">{formatTime(result.durationSeconds)}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              onClick={() => {
                clearProgress();
                window.location.reload();
              }}
            >
              <RotateCcw data-icon="inline-start" />
              {t("retry")}
            </Button>
            {mistakes.length > 0 && (
              <Button
                variant="outline"
                onClick={() => {
                  setReviewIndex(0);
                  setReviewMode(true);
                }}
              >
                {t("reviewMistakesButton", { count: mistakes.length })}
              </Button>
            )}
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/" onClick={clearProgress} />}
            >
              {t("backToListButton")}
            </Button>
          </div>
        </section>
        <section className="flex flex-col gap-3">
          {result.scored.map((item, i) => (
            <article key={item.question.id} className="rounded-2xl border bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5">
                  {item.isCorrect ? (
                    <CheckCircle2 className="text-primary" aria-label={t("correctAria")} />
                  ) : (
                    <CircleAlert className="text-destructive" aria-label={t("incorrectAria")} />
                  )}
                </span>
                <div>
                  <p className="font-semibold">
                    {i + 1}. {item.question.question}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("yourAnswerAndCorrectAnswer", {
                      selectedAnswer: item.selectedAnswer,
                      correctAnswer: item.question.correctAnswer,
                    })}
                  </p>
                  <p className="mt-2 text-sm leading-6">{item.question.explanation}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    );
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-4 py-8 sm:gap-8 sm:px-5 sm:py-10">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/"
          onClick={clearProgress}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft data-icon="inline-start" />
          {tNav("backToList")}
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <PaletteSwatches />
        </div>
      </div>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-primary">{quiz.subject}</span>
          <span
            className={`flex items-center gap-1.5 font-semibold ${timeLeft <= 30 ? "text-destructive" : "text-muted-foreground"}`}
          >
            <Clock className="size-4" />
            {t("timeLeft", { time: formatTime(timeLeft) })}
          </span>
          <span className="text-muted-foreground">
            {t("questionCounter", {
              current: index + 1,
              total: questions.length,
            })}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>
      <section className="rounded-[2rem] border bg-card p-5 shadow-sm sm:p-10">
        <p className="text-sm text-muted-foreground">{quiz.title}</p>
        <h1 className="mt-4 text-xl font-bold leading-relaxed sm:text-3xl">{current.question}</h1>
        <div className="mt-8 flex flex-col gap-3">
          {current.choices.map((choice, choiceIndex) => (
            <button
              key={choice}
              type="button"
              disabled={selected !== null}
              onClick={() => setSelected(choice)}
              className={`rounded-2xl border p-3 text-left text-base transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4 ${selected === choice ? "border-primary bg-primary/10" : ""}`}
            >
              <span className="mr-3 inline-flex size-8 items-center justify-center rounded-full bg-secondary text-sm font-bold">
                {String.fromCharCode(65 + choiceIndex)}
              </span>
              {choice}
            </button>
          ))}
        </div>
        {selected && (
          <div
            className={`mt-6 rounded-2xl border p-5 ${selected === current.correctAnswer ? "bg-primary/10" : "bg-destructive/10"}`}
          >
            <p className="font-bold">
              {selected === current.correctAnswer ? t("correctFeedback") : t("incorrectFeedback")}
            </p>
            <p className="mt-2 text-sm leading-6">
              {t("correctAnswerPrefix", { correctAnswer: current.correctAnswer })}
              <br />
              {current.explanation}
            </p>
            {current.memoryTip && (
              <p className="mt-3 text-sm font-semibold">
                {t("memoryTip", { tip: current.memoryTip })}
              </p>
            )}
          </div>
        )}
        <Button
          className="mt-6 w-full"
          disabled={!selected || submitting}
          onClick={async () => {
            if (submittedRef.current) return;
            const next = [...answers, { questionId: current.id, selectedAnswer: selected! }];
            if (index === questions.length - 1) {
              submittedRef.current = true;
              setSubmitting(true);
              try {
                setResult(
                  await submitAttempt({
                    quizId: quiz.id,
                    answers: next,
                    durationSeconds: totalSeconds - timeLeft,
                  }),
                );
              } catch (error) {
                submittedRef.current = false;
                setSubmitting(false);
                throw error;
              }
            } else {
              setAnswers(next);
              setSelected(null);
              setIndex(index + 1);
            }
          }}
        >
          {index === questions.length - 1 ? t("viewResults") : t("nextQuestion")}
        </Button>
      </section>
    </main>
  );
}
