"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CircleAlert, Clock, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { submitAttempt } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
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

export function QuizSession({ quiz }: { quiz: Quiz }) {
  const t = useTranslations("QuizSession");
  const tNav = useTranslations("Nav");
  const [questions] = useState(() =>
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

  useEffect(() => {
    if (result || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [result, timeLeft]);

  useEffect(() => {
    if (result || timeLeft > 0) return;
    const finalAnswers = selected ? [...answers, { questionId: current.id, selectedAnswer: selected }] : answers;
    void submitAttempt({
      quizId: quiz.id,
      answers: finalAnswers,
      durationSeconds: totalSeconds,
    }).then(setResult);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, result]);

  if (result)
    return (
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft data-icon="inline-start" />
            {tNav("backToList")}
          </Link>
          <LanguageSwitcher />
        </div>
        <section className="rounded-[2rem] border bg-card p-8 shadow-sm">
          <p className="text-sm font-semibold text-primary">{t("completedLabel")}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{result.quiz.title}</h1>
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
            <Button onClick={() => window.location.reload()}>
              <RotateCcw data-icon="inline-start" />
              {t("retry")}
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-5 py-10">
      <div className="flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft data-icon="inline-start" />
          {tNav("backToList")}
        </Link>
        <LanguageSwitcher />
      </div>
      <div>
        <div className="flex items-center justify-between text-sm">
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
      <section className="rounded-[2rem] border bg-card p-6 shadow-sm sm:p-10">
        <p className="text-sm text-muted-foreground">{quiz.title}</p>
        <h1 className="mt-4 text-2xl font-bold leading-relaxed sm:text-3xl">{current.question}</h1>
        <div className="mt-8 flex flex-col gap-3">
          {current.choices.map((choice, choiceIndex) => (
            <button
              key={choice}
              type="button"
              disabled={selected !== null}
              onClick={() => setSelected(choice)}
              className={`rounded-2xl border p-4 text-left text-base transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected === choice ? "border-primary bg-primary/10" : ""}`}
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
          disabled={!selected}
          onClick={async () => {
            const next = [...answers, { questionId: current.id, selectedAnswer: selected! }];
            if (index === questions.length - 1)
              setResult(
                await submitAttempt({
                  quizId: quiz.id,
                  answers: next,
                  durationSeconds: totalSeconds - timeLeft,
                }),
              );
            else {
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
