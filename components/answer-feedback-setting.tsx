"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { getStoredShowAnswerImmediately, setStoredShowAnswerImmediately } from "@/lib/quiz-settings";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// persists the default across quizzes; a single attempt can still override it temporarily (see QuizSession)
export function AnswerFeedbackSetting() {
  const t = useTranslations("QuizSession");
  // read lazily on the client; the popover content that uses this only renders after the user opens it
  const [immediate, setImmediate] = useState(() => getStoredShowAnswerImmediately());

  function update(value: boolean) {
    setImmediate(value);
    setStoredShowAnswerImmediately(value);
  }

  return (
    <Popover>
      <PopoverTrigger
        aria-label={t("headerSettingAria")}
        className="flex size-8 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Eye className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="p-1">
          <p className="text-sm font-semibold">{t("headerSettingLabel")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("headerSettingDescription")}</p>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => update(false)}
              className={`rounded-2xl border p-3 text-left text-sm font-semibold transition ${!immediate ? "border-primary bg-primary/10" : ""}`}
            >
              {t("showAnswerAtEndOption")}
            </button>
            <button
              type="button"
              onClick={() => update(true)}
              className={`rounded-2xl border p-3 text-left text-sm font-semibold transition ${immediate ? "border-primary bg-primary/10" : ""}`}
            >
              {t("showAnswerImmediatelyOption")}
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
