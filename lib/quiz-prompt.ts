// Prompt parents can paste into an external AI chat app (together with material photos) to generate a quiz JSON.
export const quizPrompt = `You are generating quiz data for the "Manabi Quiz" family learning app (a Next.js quiz app where quizzes are imported as a single JSON document via the "Add a quiz" screen).

I will attach one or more captured images of textbook or study material pages.

Your task is to:

1. Analyze only the readable information in the attached images.
2. Detect the language used in the material and write the entire output (title, description, questions, explanations, hints, etc.) in that same language. Do not translate into another language.
3. Identify every distinct subject, topic, key person, event, date, term, definition, system, law, cause, consequence, chronological relationship, culture, geography, map, timeline, diagram, and illustration shown in the images. Treat each distinct fact as a separate candidate for a question.
4. Create a single valid JSON object that can be pasted directly into the app's quiz import screen.
5. Return only the complete JSON in one \`json\` code block.
6. Do not include explanations, comments, Markdown outside the JSON code block, or JavaScript.

The JSON must use exactly this top-level structure:

{
  "title": "Quiz title, in the material's language",
  "subject": "Subject name (e.g. the school subject the material belongs to)",
  "topic": "Topic name covered by this quiz",
  "grade": "Grade/level shown or implied in the material (omit the field if truly unknown)",
  "description": "One short sentence describing what this quiz covers",
  "sourceNote": "Short note on what material this quiz is based on",
  "questions": []
}

Each question object must use exactly these fields:

{
  "question": "The question text",
  "choices": [
    "Choice 1",
    "Choice 2",
    "Choice 3",
    "Choice 4"
  ],
  "correctAnswer": "Must exactly match one of the four strings in choices",
  "explanation": "Explanation of why the correct answer is correct, written at a level suitable for the material's grade",
  "wrongChoiceExplanations": {
    "Choice 1": "Why this choice is incorrect",
    "Choice 2": "Why this choice is incorrect",
    "Choice 3": "Why this choice is incorrect"
  },
  "memoryTip": "Short, memorable tip for remembering the answer",
  "hint": "A hint that guides thinking without revealing the answer",
  "difficulty": "One of three fixed levels: Basic / Standard / Challenge, written in the material's language, used consistently across the whole quiz",
  "topic": "Narrower topic/category for this specific question",
  "points": 10,
  "sourceNote": "Short note on which part of the image(s) this question is based on"
}

Question quantity — extract exhaustively, do not stop early:

- Do NOT treat 10 questions as a target — treat it only as a minimum floor. There is no upper limit: dense, information-rich pages should produce many more questions, not fewer.
- Before writing any question, first list out every distinct fact, term, name, date, cause/effect relationship, comparison, and labeled diagram/map/timeline element visible in the images. Then generate a question for as many of those distinct items as reasonably possible.
- Only produce fewer questions than the number of distinct facts if doing so would create duplicate or near-identical questions, or if a fact is too fragmentary to support a fair question.
- If the images contain many small, related facts (e.g. a list of terms, a timeline with several entries, a table), create a separate question for each entry rather than combining them into one question or skipping most of them.
- Create at least 10 questions when the images contain at least 10 reliable facts, and continue well beyond 10 if more distinct, reliable facts are available.
- If the images genuinely contain fewer than 10 reliable facts, create fewer questions rather than inventing information.

Strict requirements:

- Use only facts clearly readable or clearly shown in the images.
- Do not guess blurry, cropped, hidden, or unreadable text.
- Do not use general background knowledge as the only basis for a question.
- If useful background knowledge is necessary to make a question answerable, mark it clearly as supplementary (e.g. "補足" / "Note:" / equivalent in the material's language) inside \`explanation\` or \`sourceNote\`.
- Do not create questions from information that is not visible in the images unless it is clearly labeled as supplementary.
- Avoid duplicate or nearly identical questions, but do not use "avoiding duplicates" as a reason to skip genuinely distinct facts.
- Every question must have exactly four choices.
- Every question must have exactly one correct answer.
- \`correctAnswer\` must exactly match one of the four strings in \`choices\`.
- \`wrongChoiceExplanations\` must contain an explanation for every incorrect choice and must not contain the correct choice.
- Every question must have a non-empty \`hint\`.
- Every question must have a non-empty \`explanation\`.
- Every question must have a non-empty \`memoryTip\`.
- \`points\` must be exactly one of:
  - \`10\` for the Basic level
  - \`15\` for the Standard level
  - \`20\` for the Challenge level
- \`difficulty\` must use exactly three consistent values across the quiz, corresponding to Basic / Standard / Challenge, written in the material's language.
- Use approximately:
  - 40% Basic
  - 40% Standard
  - 20% Challenge
- Make choices similar in length and style.
- Do not make the correct answer obvious because it is much longer than the others.
- Do not use "all of the above" / "none of the above" style choices.
- Do not use ambiguous wording.
- Do not create trick questions.
- Use language and reading level suitable for the grade/level shown or implied in the material.
- Use correct, standard terminology for the subject and language in question.
- Add pronunciation aids or readings in parentheses only when helpful and customary for that language (e.g. furigana for Japanese kanji).
- Use the punctuation conventions of the material's language.
- Escape double quotation marks correctly so the output remains valid JSON.
- Do not include trailing commas.
- Do not include comments in the JSON.
- Do not use HTML, JavaScript, Markdown, or JSON5 syntax.
- The output must be parseable by \`JSON.parse()\`.

Question balance:

Include a balanced selection of question types whenever supported by the images:

- Basic factual knowledge
- Meaning of an important term
- Identifying an important person or figure
- Matching a person with an achievement
- Identifying an event
- Identifying a date, year, or sequence
- Chronological order
- Cause and effect
- Comparing two concepts, events, or systems
- Culture, geography, or context
- Reading a map, timeline, diagram, or illustration

Do not force question types that are not supported by the images, but do check every listed fact against this list of types before discarding it.

Validation checklist before returning the JSON:

1. List every distinct fact found in the images, then count how many became questions — confirm nothing reliable was skipped without a reason (duplicate or too fragmentary).
2. Confirm that there are at least 10 questions if the images provide enough information, and more if more distinct facts are available.
3. Confirm that every question has exactly four choices.
4. Confirm that every \`correctAnswer\` occurs exactly once in its \`choices\`.
5. Confirm that every incorrect choice has an explanation.
6. Confirm that every question has a hint.
7. Confirm that every question has an explanation.
8. Confirm that every question has a memory tip.
9. Confirm that every \`points\` value matches its difficulty.
10. Confirm that \`title\`, \`subject\`, and \`topic\` are present and non-empty at the top level.
11. Confirm that all strings are valid JSON strings.
12. Confirm that there are no comments or trailing commas.
13. Confirm that the entire response is one valid JSON document, written entirely in the material's language.

Return only the complete JSON object in one \`json\` code block. It should be ready to paste directly into the quiz import screen.`;
