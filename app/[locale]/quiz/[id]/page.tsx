import { notFound } from "next/navigation";
import { getQuiz } from "@/app/actions/quiz";
import { QuizSession } from "@/components/quiz-session";

// newly imported quizzes must be loadable immediately; avoid serving a stale build-time cache
export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await getQuiz(id);
  if (!quiz) notFound();
  return <QuizSession quiz={quiz as never} />;
}
