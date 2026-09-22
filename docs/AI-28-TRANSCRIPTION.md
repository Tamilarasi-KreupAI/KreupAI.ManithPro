# AI-28 — Interview transcription (local)

**Status:** Local work is complete. Job flow is real. Default provider is **test** (reads the actual audio file). OpenAI Whisper is available when `TRANSCRIPTION_PROVIDER=openai` and `OPENAI_API_KEY` is set. Team Lead still needs to confirm the production vendor (Module 12 names “a dedicated transcription service” only).

## What changed

- `createTranscription` no longer writes `Sample transcription text from interview...`.
- Jobs start as `PENDING`, move to `IN_PROGRESS`, then `COMPLETED` or `FAILED`.
- `retryTranscription` queues the same job again.
- Recordings come from `sourceUrl` (local file) or `recordingId` → `VideoRecording.filePath` / `fileUrl` (`batch20`).
- Provider lives in `backend/src/integrations/transcription/`, same pattern as AI-02 (`getXService` + env).

## Env

```
TRANSCRIPTION_PROVIDER=test
# or
TRANSCRIPTION_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_TRANSCRIPTION_MODEL=whisper-1
```

## Test recordings

`backend/testdata/ai-28-recordings/` — synthetic tones, **not** candidate interviews.

```powershell
cd backend
npx tsx testdata/ai-28-recordings/write-fixtures.ts
npm test
```

Two files must produce two different transcripts (acceptance).

## API

`POST /api/analysis/transcriptions`

```json
{
  "interviewId": "<id>",
  "sourceType": "RECORDING",
  "sourceUrl": "testdata/ai-28-recordings/sample-a.wav"
}
```

First response is `PENDING`. Poll `GET .../transcriptions/:id` until `COMPLETED` or `FAILED`. Retry: `POST .../transcriptions/:id/retry`.
