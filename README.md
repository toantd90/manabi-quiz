# Manabi Quiz App

A learning quiz app built with Next.js, React, TypeScript, Tailwind CSS, Drizzle ORM, and Neon PostgreSQL.

Parents can import quizzes as JSON, while children can take randomized quizzes, receive immediate explanations, and review their scores.

## Features

- Quiz dashboard with available quizzes
- Bilingual UI (Japanese and English) via locale-prefixed routes
- Randomized question and answer order
- Immediate answer feedback
- Explanations, hints, and memory tips
- JSON quiz import with validation
- Transactional persistence in Neon PostgreSQL
- Server-authoritative scoring
- Attempt and answer history tables
- Soft deletion for imported quizzes
- Built-in sample quiz for preview and development
- Responsive, accessible UI

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Drizzle ORM
- PostgreSQL via Neon
- Zod
- `pg`
- Lucide React
- next-intl
- Oxlint (linting)
- Oxfmt (formatting)

## Project Structure

```text
app/
  actions/quiz.ts             Server actions for quiz data and scoring
  [locale]/
    import/page.tsx           JSON quiz import page
    quiz/[id]/page.tsx        Dynamic quiz page
    results/page.tsx          Results page
    page.tsx                  Main dashboard
    layout.tsx                Root layout and metadata
  globals.css                 Global styles and design tokens

components/
  quiz-session.tsx       Interactive quiz client component
  ui/button.tsx          Shared button component

lib/
  quiz-validation.ts     Zod schemas and import validation
  db/index.ts            Drizzle database client
  db/schema.ts           Database tables and sample quiz

i18n/
  routing.ts             Supported locales and default locale
  navigation.ts          Locale-aware Link, redirect, useRouter, etc.
  request.ts             Request-scoped locale and message loading

messages/
  ja.json                Japanese UI strings
  en.json                English UI strings

proxy.ts                 Locale detection and redirect proxy (middleware)
global.d.ts              next-intl TypeScript augmentation
drizzle.config.ts        Drizzle Kit config for schema push/generate/migrate
```

## Requirements

- Node.js 20 or newer
- pnpm
- A Neon PostgreSQL database
- A configured `DATABASE_URL` environment variable

## Environment Variables

The app reads the database connection string from:

```env
DATABASE_URL=postgresql://...
```

Keep this value private. Do not commit `.env` files or expose the connection string in client-side code.

## Installation

Install dependencies:

```bash
pnpm install
```

Create a local environment file and add your Neon connection string:

```bash
cp .env.example .env.local
```

If `.env.example` does not exist, create `.env.local` manually:

```env
DATABASE_URL=your-neon-connection-string
```

The required database tables are:

- `quizzes`
- `questions`
- `attempts`
- `attempt_answers`

In the Vercel/v0 environment, the Neon integration provisions `DATABASE_URL` automatically and the schema is applied through the connected Neon tooling.

For local development, push the schema to your Neon database with Drizzle Kit before running the app:

```bash
pnpm db:push
```

If quiz saves fail with a "relation does not exist" error, the schema has not been pushed to the database yet — run `pnpm db:push` again.

## Running Locally

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to the default locale (`/ja`).

Available routes (prefixed with a locale, `ja` or `en`):

- `/ja` or `/en` — Quiz dashboard
- `/ja/import` or `/en/import` — Import a quiz from JSON
- `/ja/quiz/sample` or `/en/quiz/sample` — Built-in sample quiz
- `/ja/quiz/[id]` or `/en/quiz/[id]` — Quiz loaded from the database
- `/ja/results` or `/en/results` — Results area

## Production Build

Create a production build:

```bash
pnpm build
```

Run the production server:

```bash
pnpm start
```

## Linting and Formatting

Lint the codebase with Oxlint:

```bash
pnpm lint
pnpm lint:fix
```

Check or apply formatting with Oxfmt:

```bash
pnpm format:check
pnpm format
```

## Quiz JSON Format

The import page accepts JSON in this format:

```json
{
  "title": "身近な科学：天気と水の変化",
  "subject": "理科",
  "topic": "天気・水の変化",
  "grade": "小学校5年",
  "description": "毎日の天気から、水の変化を学びます。",
  "sourceNote": "オリジナル問題",
  "questions": [
    {
      "question": "水が冷やされて氷になる変化を何といいますか。",
      "choices": ["蒸発", "凝固", "融解", "沸騰"],
      "correctAnswer": "凝固",
      "explanation": "水が冷やされて固体の氷になる変化は凝固です。",
      "memoryTip": "固まる＝凝固",
      "hint": "水が液体から固体になります。",
      "difficulty": "基礎",
      "points": 10
    }
  ]
}
```

Required quiz fields:

- `title`
- `subject`
- `topic`
- `questions`

Required question fields:

- `question`
- `choices` — at least two unique choices
- `correctAnswer` — must match one of the choices
- `explanation`

Optional question fields include `wrongChoiceExplanations`, `memoryTip`, `hint`, `difficulty`, `topic`, `points`, and `sourceNote`.

Invalid JSON and schema errors are returned to the import screen, localized to the current locale (Japanese or English).

## Data Flow

```text
Dashboard
  → Select quiz
  → Load quiz and questions
  → Randomize questions and choices in the browser
  → Answer questions
  → Submit answer IDs and selected answers
  → Re-load correct answers on the server
  → Calculate score server-side
  → Save attempt and answer snapshots
  → Display results
```

The server does not trust the score calculated by the browser. `submitAttempt` loads the quiz again and compares submitted answers with the stored correct answers before saving the result.

## Database Model

### `quizzes`

Stores quiz metadata, including title, subject, topic, grade, description, and soft-delete timestamp.

### `questions`

Stores questions and their choices. Choice arrays and wrong-answer explanations use PostgreSQL JSONB columns.

### `attempts`

Stores a completed quiz session, including score, accuracy, counts, and a snapshot of the quiz title.

### `attempt_answers`

Stores each submitted answer, including the selected answer, correct-answer snapshot, correctness, and earned points.

Historical answer snapshots ensure that old results remain accurate if a quiz is edited later.

## Main Implementation Files

### `app/actions/quiz.ts`

Contains server actions for listing quizzes, loading a quiz, importing quizzes, soft-deleting quizzes, and scoring attempts.

### `lib/quiz-validation.ts`

Defines Zod schemas and validates imported JSON before it reaches the database.

### `components/quiz-session.tsx`

Owns client-side quiz state, including the current question, selected answers, randomization, feedback, and final results.

### `lib/db/index.ts`

Creates the shared PostgreSQL pool and Drizzle client using `DATABASE_URL`.

### `lib/db/schema.ts`

Defines the Drizzle table schema and the built-in sample quiz.

### `drizzle.config.ts`

Drizzle Kit configuration used by `pnpm db:push`/`db:generate`/`db:migrate` to sync `lib/db/schema.ts` with the Neon database.

### `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`, `proxy.ts`

Configure next-intl: supported locales (`ja`, `en`), locale-aware navigation helpers, request-scoped message loading, and the proxy that redirects requests to a locale-prefixed path.

### `messages/ja.json`, `messages/en.json`

Hold all translated UI strings, grouped by page/section namespace.

## Development Notes

- The sample quiz is available through the special ID `sample`.
- Sample quiz attempts are displayed but are not persisted.
- Imported quizzes are soft-deleted by setting `deleted_at` instead of removing rows.
- Database reads and writes happen on the server.
- The current app does not include authentication, so import and delete operations are not restricted to a parent account.
- The locale is determined from the URL prefix (with a `NEXT_LOCALE` cookie fallback set by the proxy). Server actions receive the locale explicitly from the calling client component since actions cannot read it from the URL.

## Future Improvements

- Add parent authentication and authorization
- Connect `/results` to the `attempts` table
- Add detailed result review pages
- Calculate question counts in the dashboard query
- Add quiz editing and versioning
- Replace `sort(() => Math.random() - 0.5)` with Fisher–Yates shuffling
- Add automated tests for validation and scoring

## License

This project is private and intended for the project owner unless a separate license is added.
