import { z } from 'zod'

export type Translate = (key: string, values?: Record<string, string | number>) => string

export function createImportedQuizSchema(t: Translate) {
  const nonEmpty = z.string().trim().min(1, t('required'))

  const importedQuestionSchema = z.object({
    question: nonEmpty,
    choices: z.array(nonEmpty).min(2, t('choicesMin')),
    correctAnswer: nonEmpty,
    explanation: nonEmpty,
    wrongChoiceExplanations: z.record(z.string(), z.string()).optional(),
    memoryTip: z.string().optional(),
    hint: z.string().optional(),
    difficulty: z.string().optional(),
    topic: z.string().optional(),
    points: z.number().finite().nonnegative().default(0),
    sourceNote: z.string().optional(),
  }).superRefine((value, ctx) => {
    if (new Set(value.choices).size !== value.choices.length) ctx.addIssue({ code: 'custom', path: ['choices'], message: t('choicesDuplicate') })
    if (!value.choices.includes(value.correctAnswer)) ctx.addIssue({ code: 'custom', path: ['correctAnswer'], message: t('correctAnswerMustBeChoice') })
  })

  return z.object({
    title: nonEmpty,
    subject: nonEmpty,
    topic: nonEmpty,
    grade: z.string().optional(),
    description: z.string().optional(),
    sourceNote: z.string().optional(),
    questions: z.array(importedQuestionSchema).min(1, t('questionsMin')),
  })
}

export function parseImportedQuiz(raw: string, t: Translate) {
  try {
    return { data: createImportedQuizSchema(t).parse(JSON.parse(raw)), errors: [] as string[] }
  } catch (error) {
    if (error instanceof SyntaxError) return { data: null, errors: [t('jsonInvalid')] }
    if (error instanceof z.ZodError) return { data: null, errors: error.issues.map((issue) => t('issueMessage', { path: issue.path.join('.'), message: issue.message })) }
    return { data: null, errors: [t('unknownError')] }
  }
}

