# AI-27 sample answers and recorded scores

Question (scale 0–10):

> Describe your experience with React and TypeScript, including a production example.

| Case | Answer | status | aiScore | aiSentiment | aiConfidenceLevel |
|---|---|---|---|---|---|
| Strong | Production React/TypeScript dashboard, hooks, measured 30% faster load, shipped to 12 teams, proud of collaboration | ANALYZED | **7.7** | POSITIVE | 0.85 |
| Weak | "I used some tools." | ANALYZED | **0.8** | NEUTRAL | 0.49 |
| Unanswered | empty string | UNANSWERED | **null** | null | null |

Overall screening score (mean of stored numeric scores only):

`(7.7 + 0.8) / 2 = **4.25**`

The unanswered row is excluded.

Source of truth for tests: `backend/testdata/ai-27-sample-screening-answers.json`

## How to re-run

```powershell
cd backend
npm test
```

## API behaviour (after this change)

`POST /api/ai-screening/interviews/:interviewId/questions/:questionId/respond`

The 201 body now includes `aiScore`, `aiSentiment`, `aiConfidenceLevel`, and `status` (`ANALYZED` or `UNANSWERED`) immediately. The previous 1s `setTimeout` + `Math.random` path is gone.

`PATCH /api/ai-screening/public/:id/complete` sets `overallScore` to the mean of those stored `aiScore` values.
