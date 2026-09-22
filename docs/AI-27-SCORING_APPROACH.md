# AI-27 scoring approach

**Task:** AI-27 — Replace random AI screening scores with real answer scoring  
**Workstream:** WS7  
**Author:** Sreelekha  
**Status:** Implemented locally (AI-02 provider layer is in the repo)

## Scale

- `ScreeningQuestion.maxPoints` defaults to **10** (same as the old `Math.random() * 10`)
- `AIScreeningInterview.overallScore` = mean of stored non-null `aiScore` values

## How a response is scored

`submitResponse` and `submitChatResponse` call `evaluateScreeningAnswerWithProvider`:

1. Empty answer → **UNANSWERED**, `aiScore` / sentiment / confidence = **null** (not 0).
2. Multiple-choice with `correctAnswer` → `maxPoints` or 0.
3. If `AI_PROVIDER` is set → **AI-02** `generateStructured` returns score, sentiment, confidence on the same 0–maxPoints scale.
4. If `AI_PROVIDER` is missing or the call fails → **lexical** scorer (same stored shape). This is still an evaluation of the text, not `Math.random`.

Lexical weights when the model is unused: relevance 55%, depth 30%, specificity 15%.

## Checkable

- No `Math.random` in `batch17AIScreening.controller.ts`
- Sample scores: `backend/testdata/ai-27-sample-screening-answers.json`
- Tests: lexical suite + AI-02 mock suite (`evaluateScreeningAnswerWithProvider.test.ts`)
