// Prompt parents can paste into an external AI chat app (together with material photos) to generate a quiz JSON.
// Translated per app locale so parents can read and trust what they are pasting into the AI chat app.
// JSON keys (question, choices, correctAnswer, etc.) stay in English since the app parses those exact field names.
const quizPromptEn = `You are generating quiz data for the "Manabi Quiz" family learning app (a Next.js quiz app where quizzes are imported as a single JSON document via the "Add a quiz" screen).

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

const quizPromptJa = `あなたは「まなびクイズ」という家族向け学習アプリ（Next.js製のクイズアプリで、「クイズを追加」画面から1つのJSONドキュメントとしてクイズを取り込みます）向けのクイズデータを作成します。

教材（教科書や参考書のページ）を撮影した画像を1枚以上添付します。

あなたのタスクは次のとおりです。

1. 添付された画像の中で読み取れる情報のみを分析すること。
2. 教材で使われている言語を判定し、出力全体（title、description、questions、explanation、hintなど）をその言語で書くこと。他の言語に翻訳しないこと。
3. 画像に写っているすべての異なる教科、単元、重要人物、出来事、年代、用語、定義、制度、法則、原因、結果、時系列の関係、文化、地理、地図、年表、図表、イラストを特定すること。それぞれの異なる事実を、問題の候補として個別に扱うこと。
4. アプリのクイズ取り込み画面にそのまま貼り付けられる、1つの有効なJSONオブジェクトを作成すること。
5. 完成したJSON全体のみを、1つの \`json\` コードブロックで返すこと。
6. JSON以外の説明文、コメント、Markdown、JavaScriptを含めないこと。

JSONは、次のトップレベル構造を正確に使用してください（キー名は英語のまま、値は教材の言語で記述します）。

{
  "title": "教材の言語で書いたクイズのタイトル",
  "subject": "教科名（教材が属する学校の教科など）",
  "topic": "このクイズが扱う単元名",
  "grade": "教材に示されている、または推測できる学年・レベル（本当に不明な場合はこの項目自体を省略）",
  "description": "このクイズの内容を一文で説明したもの",
  "sourceNote": "このクイズがどの教材に基づいているかの短い注記",
  "questions": []
}

各問題オブジェクトは、次のフィールドを正確に使用してください（キー名は英語のまま、値は教材の言語で記述します）。

{
  "question": "問題文",
  "choices": [
    "選択肢1",
    "選択肢2",
    "選択肢3",
    "選択肢4"
  ],
  "correctAnswer": "choicesの4つの文字列のいずれか1つと完全に一致させること",
  "explanation": "正解が正しい理由の説明。教材の学年に適したレベルで書くこと",
  "wrongChoiceExplanations": {
    "選択肢1": "この選択肢が誤りである理由",
    "選択肢2": "この選択肢が誤りである理由",
    "選択肢3": "この選択肢が誤りである理由"
  },
  "memoryTip": "答えを覚えるための短く覚えやすいコツ",
  "hint": "正解を明かさずに考え方を助けるヒント",
  "difficulty": "3段階のうちの1つ：基本 / 標準 / 発展（教材の言語で、クイズ全体を通して一貫して使用すること）",
  "topic": "この問題に固有の、より細かい単元・カテゴリ",
  "points": 10,
  "sourceNote": "この問題が画像のどの部分に基づいているかの短い注記"
}

問題数について — 網羅的に抽出し、早めに切り上げないこと。

- 10問を「目標」として扱わず、あくまで「最低ライン」として扱うこと。上限はない。情報量の多いページからは、10問より少なくではなく、もっと多くの問題を作ること。
- 問題を書き始める前に、まず画像に写っているすべての異なる事実・用語・人名・年代・因果関係・比較・図表や地図や年表のラベル付き要素を洗い出すこと。そのうえで、できるだけ多くの項目について問題を作ること。
- 重複または内容がほぼ同じ問題になってしまう場合、または断片的すぎて公正な問題にできない場合に限り、事実の数より問題数を少なくしてよい。
- 画像に多数の小さな関連する事実（用語の一覧、複数の項目を含む年表、表など）が含まれる場合は、それらをまとめたり大部分を省略したりせず、各項目ごとに個別の問題を作ること。
- 画像に少なくとも10個の信頼できる事実が含まれる場合は、少なくとも10問を作成し、さらに事実がある場合は10問を超えて作成し続けること。
- 画像に含まれる信頼できる事実が本当に10個未満の場合は、情報をでっち上げるのではなく、問題数を少なくすること。

厳守事項：

- 画像の中で明確に読み取れる、または明確に示されている事実のみを使用すること。
- ぼやけている、切れている、隠れている、読み取れない文字を推測しないこと。
- 一般的な背景知識のみを根拠とした問題を作らないこと。
- 問題を成立させるために有用な背景知識が必要な場合は、\`explanation\` または \`sourceNote\` の中で「補足」（教材の言語での同等表現）として明確に示すこと。
- 画像に写っていない情報から問題を作らないこと。ただし明確に補足として示されている場合を除く。
- 重複または内容がほぼ同じ問題は避けること。ただし「重複を避ける」ことを理由に、明確に異なる事実を省略しないこと。
- すべての問題に、必ず4つの選択肢を用意すること。
- すべての問題に、正解は必ず1つだけ用意すること。
- \`correctAnswer\` は \`choices\` の4つの文字列のいずれか1つと完全に一致させること。
- \`wrongChoiceExplanations\` には、誤っている選択肢すべてについて説明を含め、正解の選択肢を含めないこと。
- すべての問題に、空でない \`hint\` を用意すること。
- すべての問題に、空でない \`explanation\` を用意すること。
- すべての問題に、空でない \`memoryTip\` を用意すること。
- \`points\` は必ず次のいずれかにすること。
  - 「基本」レベルは \`10\`
  - 「標準」レベルは \`15\`
  - 「発展」レベルは \`20\`
- \`difficulty\` は、基本／標準／発展に対応する3種類の値を、クイズ全体を通して一貫して（教材の言語で）使用すること。
- 選択肢の割合はおおよそ次のようにすること。
  - 基本 40%
  - 標準 40%
  - 発展 20%
- 選択肢の長さや文体を揃えること。
- 正解が他より明らかに長いことで、正解だとわかってしまわないようにすること。
- 「上記すべて」「上記のいずれでもない」のような選択肢を使わないこと。
- あいまいな表現を使わないこと。
- ひっかけ問題を作らないこと。
- 教材に示されている、または推測できる学年・レベルに適した言葉づかいと読みやすさで書くこと。
- その教科・言語における正しい標準的な用語を使うこと。
- その言語で役立ち慣習的な場合に限り、括弧内に読み方（日本語の漢字にふりがなをつけるなど）を補うこと。
- 教材の言語の句読点の使い方に従うこと。
- ダブルクォーテーションは正しくエスケープし、有効なJSONとして出力すること。
- 末尾のカンマを含めないこと。
- JSON内にコメントを含めないこと。
- HTML、JavaScript、Markdown、JSON5構文を使わないこと。
- 出力は \`JSON.parse()\` でパースできるものにすること。

問題タイプのバランス：

画像の内容から可能な範囲で、次のようなタイプの問題をバランスよく含めてください。

- 基本的な知識の確認
- 重要な用語の意味
- 重要な人物の特定
- 人物とその功績の組み合わせ
- 出来事の特定
- 年代・年号・順序の特定
- 時系列の並べ替え
- 原因と結果
- 2つの概念・出来事・制度の比較
- 文化・地理・背景に関する内容
- 地図・年表・図表・イラストの読み取り

画像で裏付けられないタイプの問題を無理に作る必要はありませんが、事実を捨てる前に、必ずこのタイプ一覧と照らし合わせて確認してください。

JSONを返す前の確認チェックリスト：

1. 画像の中の異なる事実をすべて洗い出し、そのうち何個が問題になったかを数える。理由（重複または断片的すぎる）なしに、信頼できる事実が省略されていないか確認する。
2. 画像から十分な情報が得られる場合、少なくとも10問あるか確認する。さらに事実がある場合は10問を超えているか確認する。
3. すべての問題に、ちょうど4つの選択肢があるか確認する。
4. すべての \`correctAnswer\` が、その \`choices\` の中にちょうど1回だけ出現しているか確認する。
5. すべての誤答選択肢に説明があるか確認する。
6. すべての問題にヒントがあるか確認する。
7. すべての問題に解説があるか確認する。
8. すべての問題に覚え方があるか確認する。
9. すべての \`points\` の値が、その難易度に対応しているか確認する。
10. トップレベルの \`title\`、\`subject\`、\`topic\` が存在し、空でないか確認する。
11. すべての文字列が、有効なJSON文字列になっているか確認する。
12. コメントや末尾のカンマがないか確認する。
13. 応答全体が、教材の言語で書かれた1つの有効なJSONドキュメントになっているか確認する。

完成したJSONオブジェクトのみを、1つの \`json\` コードブロックで返してください。クイズ取り込み画面にそのまま貼り付けられる状態にしてください。`;

const quizPromptVi = `Bạn đang tạo dữ liệu quiz cho ứng dụng học tập gia đình "Manabi Quiz" (một ứng dụng quiz Next.js, nơi các quiz được nhập vào dưới dạng một tài liệu JSON duy nhất qua màn hình "Thêm quiz").

Tôi sẽ đính kèm một hoặc nhiều ảnh chụp các trang sách giáo khoa hoặc tài liệu học tập.

Nhiệm vụ của bạn là:

1. Chỉ phân tích những thông tin có thể đọc được trong các ảnh đính kèm.
2. Xác định ngôn ngữ được dùng trong tài liệu và viết toàn bộ kết quả (title, description, questions, explanation, hint, v.v.) bằng chính ngôn ngữ đó. Không dịch sang ngôn ngữ khác.
3. Xác định mọi môn học, chủ đề, nhân vật quan trọng, sự kiện, ngày tháng, thuật ngữ, định nghĩa, hệ thống, quy luật, nguyên nhân, hệ quả, mối quan hệ theo trình tự thời gian, văn hóa, địa lý, bản đồ, dòng thời gian, sơ đồ và hình minh họa xuất hiện trong ảnh. Coi mỗi sự kiện/thông tin riêng biệt là một ứng viên cho một câu hỏi.
4. Tạo ra một đối tượng JSON hợp lệ duy nhất, có thể dán trực tiếp vào màn hình nhập quiz của ứng dụng.
5. Chỉ trả về JSON hoàn chỉnh trong một khối mã \`json\` duy nhất.
6. Không thêm phần giải thích, chú thích, Markdown ngoài JSON, hay JavaScript.

JSON phải sử dụng chính xác cấu trúc cấp cao nhất sau đây (giữ nguyên tên khóa bằng tiếng Anh, nhưng viết nội dung giá trị bằng ngôn ngữ của tài liệu):

{
  "title": "Tiêu đề quiz, viết bằng ngôn ngữ của tài liệu",
  "subject": "Tên môn học (ví dụ: môn học ở trường mà tài liệu thuộc về)",
  "topic": "Tên chủ đề mà quiz này đề cập",
  "grade": "Khối lớp/trình độ được ghi rõ hoặc ngụ ý trong tài liệu (bỏ qua trường này nếu thực sự không biết)",
  "description": "Một câu ngắn mô tả nội dung của quiz này",
  "sourceNote": "Ghi chú ngắn về tài liệu mà quiz này dựa trên",
  "questions": []
}

Mỗi đối tượng câu hỏi phải sử dụng chính xác các trường sau (giữ nguyên tên khóa bằng tiếng Anh, nhưng viết nội dung giá trị bằng ngôn ngữ của tài liệu):

{
  "question": "Nội dung câu hỏi",
  "choices": [
    "Đáp án 1",
    "Đáp án 2",
    "Đáp án 3",
    "Đáp án 4"
  ],
  "correctAnswer": "Phải trùng khớp chính xác với một trong bốn chuỗi trong choices",
  "explanation": "Giải thích vì sao đáp án đúng là đúng, viết ở mức độ phù hợp với trình độ/khối lớp của tài liệu",
  "wrongChoiceExplanations": {
    "Đáp án 1": "Vì sao đáp án này sai",
    "Đáp án 2": "Vì sao đáp án này sai",
    "Đáp án 3": "Vì sao đáp án này sai"
  },
  "memoryTip": "Mẹo ngắn, dễ nhớ để ghi nhớ đáp án",
  "hint": "Gợi ý giúp định hướng suy nghĩ mà không tiết lộ đáp án",
  "difficulty": "Một trong ba mức cố định: Cơ bản / Trung bình / Nâng cao, viết bằng ngôn ngữ của tài liệu, dùng nhất quán trong toàn bộ quiz",
  "topic": "Chủ đề/danh mục hẹp hơn dành riêng cho câu hỏi này",
  "points": 10,
  "sourceNote": "Ghi chú ngắn về câu hỏi này dựa trên phần nào của (các) ảnh"
}

Số lượng câu hỏi — trích xuất một cách triệt để, không dừng lại sớm:

- KHÔNG coi 10 câu hỏi là mục tiêu cần đạt — chỉ coi đó là mức tối thiểu. Không có giới hạn trên: những trang chứa nhiều thông tin nên tạo ra nhiều câu hỏi hơn, chứ không phải ít hơn.
- Trước khi viết bất kỳ câu hỏi nào, hãy liệt kê trước mọi sự kiện, thuật ngữ, tên riêng, ngày tháng, mối quan hệ nguyên nhân/hệ quả, so sánh, và các yếu tố có nhãn trong sơ đồ/bản đồ/dòng thời gian xuất hiện trong ảnh. Sau đó tạo câu hỏi cho càng nhiều mục trong số đó càng tốt, trong phạm vi hợp lý.
- Chỉ tạo ít câu hỏi hơn số lượng sự kiện riêng biệt nếu việc làm vậy sẽ tạo ra câu hỏi trùng lặp hoặc gần giống nhau, hoặc nếu một sự kiện quá rời rạc để tạo thành câu hỏi công bằng.
- Nếu ảnh chứa nhiều sự kiện nhỏ có liên quan (ví dụ: danh sách thuật ngữ, dòng thời gian có nhiều mốc, bảng biểu), hãy tạo một câu hỏi riêng cho từng mục thay vì gộp chúng lại hoặc bỏ qua phần lớn.
- Tạo ít nhất 10 câu hỏi khi ảnh chứa ít nhất 10 sự kiện đáng tin cậy, và tiếp tục vượt quá 10 nếu còn nhiều sự kiện riêng biệt khác.
- Nếu ảnh thực sự chứa ít hơn 10 sự kiện đáng tin cậy, hãy tạo ít câu hỏi hơn thay vì bịa đặt thông tin.

Yêu cầu bắt buộc:

- Chỉ sử dụng những sự kiện được đọc rõ hoặc thể hiện rõ trong ảnh.
- Không đoán chữ bị mờ, bị cắt, bị che khuất hoặc không đọc được.
- Không dùng kiến thức nền chung chung làm cơ sở duy nhất cho một câu hỏi.
- Nếu cần kiến thức nền hữu ích để câu hỏi có thể trả lời được, hãy ghi rõ đó là phần bổ sung (ví dụ: "Bổ sung:" hoặc từ tương đương trong ngôn ngữ của tài liệu) bên trong \`explanation\` hoặc \`sourceNote\`.
- Không tạo câu hỏi từ thông tin không xuất hiện trong ảnh, trừ khi được ghi rõ là phần bổ sung.
- Tránh câu hỏi trùng lặp hoặc gần giống nhau, nhưng không dùng lý do "tránh trùng lặp" để bỏ qua những sự kiện thực sự khác biệt.
- Mỗi câu hỏi phải có đúng bốn đáp án.
- Mỗi câu hỏi phải có đúng một đáp án đúng.
- \`correctAnswer\` phải trùng khớp chính xác với một trong bốn chuỗi trong \`choices\`.
- \`wrongChoiceExplanations\` phải chứa giải thích cho mọi đáp án sai và không được chứa đáp án đúng.
- Mỗi câu hỏi phải có \`hint\` không rỗng.
- Mỗi câu hỏi phải có \`explanation\` không rỗng.
- Mỗi câu hỏi phải có \`memoryTip\` không rỗng.
- \`points\` phải là chính xác một trong các giá trị sau:
  - \`10\` cho mức Cơ bản
  - \`15\` cho mức Trung bình
  - \`20\` cho mức Nâng cao
- \`difficulty\` phải dùng đúng ba giá trị nhất quán trong toàn bộ quiz, tương ứng với Cơ bản / Trung bình / Nâng cao, viết bằng ngôn ngữ của tài liệu.
- Sử dụng tỉ lệ xấp xỉ:
  - 40% Cơ bản
  - 40% Trung bình
  - 20% Nâng cao
- Làm cho các đáp án có độ dài và văn phong tương đồng nhau.
- Không để đáp án đúng trở nên dễ đoán vì nó dài hơn hẳn các đáp án khác.
- Không dùng các đáp án kiểu "tất cả các đáp án trên" / "không có đáp án nào đúng".
- Không dùng cách diễn đạt mơ hồ.
- Không tạo câu hỏi đánh lừa (bẫy).
- Sử dụng ngôn ngữ và mức độ phù hợp với trình độ/khối lớp được ghi rõ hoặc ngụ ý trong tài liệu.
- Sử dụng thuật ngữ chuẩn, chính xác cho môn học và ngôn ngữ đang dùng.
- Chỉ thêm phần hỗ trợ phát âm trong ngoặc đơn khi hữu ích và phù hợp với thông lệ của ngôn ngữ đó (ví dụ: furigana cho chữ kanji trong tiếng Nhật).
- Tuân theo quy tắc dấu câu của ngôn ngữ trong tài liệu.
- Escape dấu ngoặc kép đúng cách để kết quả vẫn là JSON hợp lệ.
- Không có dấu phẩy thừa ở cuối.
- Không thêm chú thích (comment) trong JSON.
- Không sử dụng cú pháp HTML, JavaScript, Markdown hay JSON5.
- Kết quả phải có thể phân tích được bằng \`JSON.parse()\`.

Cân bằng loại câu hỏi:

Bao gồm sự đa dạng cân bằng về loại câu hỏi bất cứ khi nào ảnh cho phép:

- Kiến thức cơ bản
- Ý nghĩa của một thuật ngữ quan trọng
- Xác định một nhân vật quan trọng
- Ghép nhân vật với thành tựu của họ
- Xác định một sự kiện
- Xác định ngày tháng, năm, hoặc trình tự
- Sắp xếp theo trình tự thời gian
- Nguyên nhân và hệ quả
- So sánh hai khái niệm, sự kiện hoặc hệ thống
- Văn hóa, địa lý hoặc bối cảnh
- Đọc hiểu bản đồ, dòng thời gian, sơ đồ hoặc hình minh họa

Không cố ép tạo những loại câu hỏi mà ảnh không hỗ trợ, nhưng hãy đối chiếu mỗi sự kiện với danh sách loại câu hỏi này trước khi loại bỏ nó.

Danh sách kiểm tra trước khi trả về JSON:

1. Liệt kê mọi sự kiện riêng biệt tìm thấy trong ảnh, sau đó đếm xem bao nhiêu sự kiện đã trở thành câu hỏi — xác nhận không có sự kiện đáng tin cậy nào bị bỏ sót mà không có lý do (trùng lặp hoặc quá rời rạc).
2. Xác nhận có ít nhất 10 câu hỏi nếu ảnh cung cấp đủ thông tin, và nhiều hơn nếu còn nhiều sự kiện riêng biệt khác.
3. Xác nhận mọi câu hỏi đều có đúng bốn đáp án.
4. Xác nhận mọi \`correctAnswer\` xuất hiện đúng một lần trong \`choices\` của nó.
5. Xác nhận mọi đáp án sai đều có giải thích.
6. Xác nhận mọi câu hỏi đều có hint.
7. Xác nhận mọi câu hỏi đều có explanation.
8. Xác nhận mọi câu hỏi đều có memory tip.
9. Xác nhận mọi giá trị \`points\` khớp với mức độ khó của nó.
10. Xác nhận \`title\`, \`subject\` và \`topic\` ở cấp cao nhất đều tồn tại và không rỗng.
11. Xác nhận mọi chuỗi đều là chuỗi JSON hợp lệ.
12. Xác nhận không có chú thích hay dấu phẩy thừa ở cuối.
13. Xác nhận toàn bộ phản hồi là một tài liệu JSON hợp lệ duy nhất, được viết hoàn toàn bằng ngôn ngữ của tài liệu.

Chỉ trả về đối tượng JSON hoàn chỉnh trong một khối mã \`json\` duy nhất. Kết quả cần sẵn sàng để dán trực tiếp vào màn hình nhập quiz.`;

const quizPrompts: Record<string, string> = {
  en: quizPromptEn,
  ja: quizPromptJa,
  vi: quizPromptVi,
};

export function getQuizPrompt(locale: string): string {
  return quizPrompts[locale] ?? quizPromptEn;
}
