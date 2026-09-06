import { notFound } from "next/navigation";
import { getQuiz } from "@/app/actions/quiz";
import { QuizSession } from "@/components/quiz-session";

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quiz = await getQuiz(id);
  if (!quiz) notFound();
  return <QuizSession quiz={quiz as never} />;
}
