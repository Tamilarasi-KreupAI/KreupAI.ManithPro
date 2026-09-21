# AI-27 test results

Date: 2026-09-16

## grep (acceptance)

```
Select-String -Path backend\src\controllers\batch17AIScreening.controller.ts -Pattern "Math.random"
```

Result: **zero matches**.

## Unit tests

```
cd backend
npm test
```

```
tests 8
pass 8
fail 0
```

Coverage of acceptance criteria:

| Criterion | Result |
|---|---|
| No `Math.random` in the screening controller | pass |
| Strong vs weak answer to the same question score differently (7.7 vs 0.8) | pass |
| Empty answer stored as UNANSWERED with null score | pass |
| Overall score is the mean of stored numeric scores (4.25), unanswered excluded | pass |
| Scores stay on 0–10 (`maxPoints`) | pass |
| Sample answers and scores committed | `backend/testdata/ai-27-sample-screening-answers.json` |

## API (manual, when backend is running)

Submit is now scored in the same request (no delayed random update):

```
POST /api/ai-screening/interviews/:interviewId/questions/:questionId/respond
Authorization: Bearer <token>
Content-Type: application/json

{ "responseType": "TEXT", "textResponse": "<answer>" }
```

Expect 201 with `aiScore`, `aiSentiment`, `aiConfidenceLevel`, `status` = `ANALYZED` or `UNANSWERED`.

Complete interview:

```
PATCH /api/ai-screening/public/:id/complete
```

Expect `overallScore` = average of non-null `aiScore` values on that interview.
