# AI-28 test recordings

These files are **synthetic test tones**, not candidate interviews.

- `sample-a.wav` / `sample-b.wav` — generated locally; different byte patterns so transcripts differ.

Regenerate:

```powershell
cd backend
npx tsx testdata/ai-28-recordings/write-fixtures.ts
```
