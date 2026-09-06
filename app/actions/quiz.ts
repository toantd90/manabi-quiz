"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, isNull } from "drizzle-orm";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { db } from "@/lib/db";
import { attempts, attemptAnswers, questions, quizzes, sampleQuiz } from "@/lib/db/schema";
import { parseImportedQuiz, type Translate } from "@/lib/quiz-validation";
import { routing } from "@/i18n/routing";

function resolveLocale(locale: string) {
  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

export async function listQuizzes() {
  try {
    const rows = await db
      .select()
      .from(quizzes)
      .where(isNull(quizzes.deletedAt))
      .orderBy(desc(quizzes.createdAt));
    if (rows.length) return rows.map((quiz) => ({ ...quiz, questionCount: 0 }));
  } catch (error) {
    console.error("listQuizzes failed", error); /* preview can still render the sample */
  }
  return [
    {
      id: "sample",
      title: sampleQuiz.title,
      subject: sampleQuiz.subject,
      topic: sampleQuiz.topic,
      grade: sampleQuiz.grade,
      description: sampleQuiz.description,
      sourceNote: sampleQuiz.sourceNote,
      createdAt: new Date(),
      deletedAt: null,
      questionCount: sampleQuiz.questions.length,
    },
  ];
}

export async function listAttempts() {
  try {
    return await db.select().from(attempts).orderBy(desc(attempts.completedAt));
  } catch (error) {
    console.error("listAttempts failed", error);
    return [];
  }
}

export async function getQuiz(id: string) {
  if (id === "sample")
    return {
      ...sampleQuiz,
      id,
      questions: sampleQuiz.questions.map((question, index) => ({
        ...question,
        id: `sample-${index}`,
        quizId: id,
      })),
    };
  const [quiz] = await db
    .select()
    .from(quizzes)
    .where(and(eq(quizzes.id, id), isNull(quizzes.deletedAt)));
  if (!quiz) return null;
  const quizQuestions = await db.select().from(questions).where(eq(questions.quizId, id));
  return { ...quiz, questions: quizQuestions };
}

export async function importQuiz(locale: string, raw: string) {
  const t = await getTranslations({ locale: resolveLocale(locale), namespace: "Validation" });
  const parsed = parseImportedQuiz(raw, t as Translate);
  if (!parsed.data) return { ok: false, errors: parsed.errors };
  const quiz = parsed.data;
  try {
    await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(quizzes)
        .values({
          title: quiz.title,
          subject: quiz.subject,
          topic: quiz.topic,
          grade: quiz.grade,
          description: quiz.description,
          sourceNote: quiz.sourceNote,
        })
        .returning({ id: quizzes.id });
      await tx.insert(questions).values(
        quiz.questions.map((question) => ({
          quizId: created.id,
          question: question.question,
          choices: question.choices,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          wrongChoiceExplanations: question.wrongChoiceExplanations,
          memoryTip: question.memoryTip,
          hint: question.hint,
          difficulty: question.difficulty,
          topic: question.topic,
          points: String(question.points),
          sourceNote: question.sourceNote,
        })),
      );
    });
    revalidatePath("/[locale]", "layout");
    return { ok: true, errors: [] };
  } catch (error) {
    console.error("importQuiz failed", error);
    return { ok: false, errors: [t("saveFailed")] };
  }
}

export async function deleteQuiz(locale: string, id: string) {
  if (id === "sample") {
    const t = await getTranslations({ locale: resolveLocale(locale), namespace: "Validation" });
    return { ok: false, message: t("sampleCannotDelete") };
  }
  await db.update(quizzes).set({ deletedAt: new Date() }).where(eq(quizzes.id, id));
  revalidatePath("/[locale]", "layout");
  return { ok: true };
}

export async function submitAttempt(input: {
  quizId: string;
  answers: { questionId: string; selectedAnswer: string }[];
  durationSeconds: number;
}) {
  const quiz = await getQuiz(input.quizId);
  if (!quiz) throw new Error("Quiz not found");
  const scored = quiz.questions.map((question) => {
    const answer = input.answers.find((item) => item.questionId === question.id);
    const isCorrect = answer?.selectedAnswer === question.correctAnswer;
    return {
      question,
      selectedAnswer: answer?.selectedAnswer ?? "",
      isCorrect,
      pointsEarned: isCorrect ? Number(question.points) : 0,
    };
  });
  const score = scored.reduce((sum, item) => sum + item.pointsEarned, 0);
  const maxScore = scored.reduce((sum, item) => sum + Number(item.question.points), 0);
  const correctCount = scored.filter((item) => item.isCorrect).length;
  if (input.quizId !== "sample") {
    await db.transaction(async (tx) => {
      const [attempt] = await tx
        .insert(attempts)
        .values({
          quizId: input.quizId,
          quizTitleSnapshot: quiz.title,
          score: String(score),
          maxScore: String(maxScore),
          correctCount,
          incorrectCount: scored.length - correctCount,
          totalCount: scored.length,
          accuracy: String(scored.length ? Math.round((correctCount / scored.length) * 100) : 0),
          durationSeconds: input.durationSeconds,
        })
        .returning({ id: attempts.id });
      await tx.insert(attemptAnswers).values(
        scored.map((item) => ({
          attemptId: attempt.id,
          questionId: item.question.id,
          selectedAnswer: item.selectedAnswer,
          correctAnswerSnapshot: item.question.correctAnswer,
          isCorrect: item.isCorrect,
          pointsEarned: String(item.pointsEarned),
        })),
      );
    });
  }
  return {
    quiz,
    scored,
    score,
    maxScore,
    correctCount,
    incorrectCount: scored.length - correctCount,
    totalCount: scored.length,
    accuracy: scored.length ? Math.round((correctCount / scored.length) * 100) : 0,
    durationSeconds: input.durationSeconds,
  };
}
