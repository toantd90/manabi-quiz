"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardCopy, FileJson, Sparkles, Upload } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { importQuiz } from "@/app/actions/quiz";
import { Button } from "@/components/ui/button";
import { DisplaySettings } from "@/components/display-settings";
import { Link } from "@/i18n/navigation";
import { sampleQuiz } from "@/lib/db/schema";
import { quizPrompt } from "@/lib/quiz-prompt";

const example = JSON.stringify(sampleQuiz, null, 2);

export default function ImportPage() {
  const t = useTranslations("ImportPage");
  const tNav = useTranslations("Nav");
  const locale = useLocale();
  const [raw, setRaw] = useState(example);
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-5 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft data-icon="inline-start" />
            {tNav("backToList")}
          </Link>
          <DisplaySettings />
        </div>
        <div className="mt-8 sm:mt-10">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary">
              <FileJson data-icon="inline-start" />
            </span>
            <div>
              <p className="text-sm font-semibold text-primary">{t("audienceLabel")}</p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
            </div>
          </div>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{t("description")}</p>
        </div>
        <section className="mt-8 rounded-3xl border bg-card p-4 shadow-sm sm:p-7">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">{t("promptStepTitle")}</h2>
          </div>
          <p className="mt-2 leading-6 text-muted-foreground">{t("promptStepDescription")}</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
            <li>{t("promptStep1")}</li>
            <li>{t("promptStep2")}</li>
            <li>{t("promptStep3")}</li>
          </ol>
          <details className="mt-4 rounded-2xl border bg-background/60 p-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="cursor-pointer text-sm font-semibold">
              {t("promptToggle")}
            </summary>
            <pre className="mt-3 max-h-80 overflow-auto rounded-xl border bg-background p-4 font-mono text-xs leading-5 whitespace-pre-wrap">
              {quizPrompt}
            </pre>
            <Button
              variant="secondary"
              className="mt-3"
              onClick={async () => {
                await navigator.clipboard.writeText(quizPrompt);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              <ClipboardCopy data-icon="inline-start" />
              {copied ? t("promptCopied") : t("copyPrompt")}
            </Button>
          </details>
        </section>
        <section className="mt-6 rounded-3xl border bg-card p-4 shadow-sm sm:p-7">
          <label htmlFor="quiz-json" className="text-sm font-semibold">
            {t("jsonLabel")}
          </label>
          <textarea
            id="quiz-json"
            value={raw}
            onChange={(event) => setRaw(event.target.value)}
            className="mt-3 min-h-70 w-full rounded-2xl border bg-background p-4 font-mono text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-110"
            spellCheck={false}
          />
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              disabled={pending}
              onClick={async () => {
                setPending(true);
                setErrors([]);
                setSuccess(false);
                const result = await importQuiz(locale, raw);
                setPending(false);
                if (result.ok) {
                  setSuccess(true);
                  setErrors([]);
                } else setErrors(result.errors);
              }}
            >
              <Upload data-icon="inline-start" />
              {pending ? t("saving") : t("save")}
            </Button>
            <Button variant="ghost" onClick={() => setRaw("")}>
              {t("clear")}
            </Button>
          </div>
          {errors.length > 0 && (
            <div
              className="mt-5 rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm leading-6"
              role="alert"
            >
              <p className="font-bold">{t("errorsTitle")}</p>
              <ul className="mt-2 list-disc pl-5">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {success && (
            <div className="mt-5 flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-sm font-semibold">
              <CheckCircle2 />
              {t("successMessage")}
              <Link href="/" className="underline">
                {t("viewList")}
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
