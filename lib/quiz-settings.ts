// user's default preference for when to reveal answers during a quiz; each quiz attempt
// can still override this temporarily without changing the saved default (see quiz-session.tsx)
const SHOW_ANSWER_IMMEDIATELY_STORAGE_KEY = "manabi-quiz-show-answer-immediately";

export function getStoredShowAnswerImmediately(): boolean {
  try {
    return localStorage.getItem(SHOW_ANSWER_IMMEDIATELY_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setStoredShowAnswerImmediately(value: boolean) {
  try {
    localStorage.setItem(SHOW_ANSWER_IMMEDIATELY_STORAGE_KEY, String(value));
  } catch {
    // storage may be unavailable (e.g. private browsing)
  }
}
