import {
  pgTable,
  uuid,
  text,
  jsonb,
  numeric,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const quizzes = pgTable("quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  grade: text("grade"),
  description: text("description"),
  sourceNote: text("source_note"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id").notNull(),
  question: text("question").notNull(),
  choices: jsonb("choices").$type<string[]>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  wrongChoiceExplanations: jsonb("wrong_choice_explanations").$type<Record<string, string>>(),
  memoryTip: text("memory_tip"),
  hint: text("hint"),
  difficulty: text("difficulty"),
  topic: text("topic"),
  points: numeric("points").notNull().default("0"),
  sourceNote: text("source_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const attempts = pgTable("attempts", {
  id: uuid("id").defaultRandom().primaryKey(),
  quizId: uuid("quiz_id").notNull(),
  quizTitleSnapshot: text("quiz_title_snapshot").notNull(),
  score: numeric("score").notNull().default("0"),
  maxScore: numeric("max_score").notNull().default("0"),
  correctCount: integer("correct_count").notNull().default(0),
  incorrectCount: integer("incorrect_count").notNull().default(0),
  totalCount: integer("total_count").notNull().default(0),
  accuracy: numeric("accuracy").notNull().default("0"),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
});

export const attemptAnswers = pgTable("attempt_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  attemptId: uuid("attempt_id").notNull(),
  questionId: uuid("question_id").notNull(),
  selectedAnswer: text("selected_answer").notNull(),
  correctAnswerSnapshot: text("correct_answer_snapshot").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  pointsEarned: numeric("points_earned").notNull().default("0"),
});

export type Quiz = typeof quizzes.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type AttemptAnswer = typeof attemptAnswers.$inferSelect;

export const sampleQuiz = {
  title: "身近な科学：天気と水の変化",
  subject: "理科",
  topic: "天気・水の変化",
  grade: "小学校5年",
  description: "毎日の天気から、雲と水の変化を楽しく確認しましょう。",
  sourceNote: "サンプル問題",
  questions: [
    {
      question: "水が冷やされて氷になる変化を何といいますか。",
      choices: ["蒸発", "凝固", "融解", "沸騰"],
      correctAnswer: "凝固",
      explanation: "水が冷やされて固体の氷になる変化は凝固です。",
      memoryTip: "固まる＝凝固",
      points: 10,
    },
    {
      question: "空気中の水蒸気が冷えて水滴になることを何といいますか。",
      choices: ["凝結", "燃焼", "ろ過", "溶解"],
      correctAnswer: "凝結",
      explanation: "水蒸気が冷えて水滴になる変化が凝結です。",
      memoryTip: "水蒸気が水に戻る＝凝結",
      points: 10,
    },
    {
      question: "雨が降ったあと、地面の水が水蒸気になる変化はどれですか。",
      choices: ["蒸発", "凝固", "融解", "結晶"],
      correctAnswer: "蒸発",
      explanation: "液体の水が気体の水蒸気になることを蒸発といいます。",
      memoryTip: "水が空へ移る＝蒸発",
      points: 10,
    },
  ],
} as const;

export type SampleQuiz = typeof sampleQuiz;
