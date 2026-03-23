# BuildWith AI

BuildWith AI is a demo-focused AI web app builder.

Users type a plain-English instruction (for example, "add a black header with white text") and instantly see a live interactive preview rendered in a sandboxed iframe.

## What It Does

- Takes prompt input from the UI.
- Sends prompt to a serverless backend endpoint (`/api/generate`).
- Uses LLM generation with provider fallback.
- Returns clean HTML/CSS/JS.
- Renders output in live preview.
- Supports iterative prompting with prompt-history context (typed prompts only).

## Current Feature Set

### Frontend

- Clean app shell with sidebar + preview canvas + bottom input bar.
- Prompt chips with refresh.
- Generate flow with loading, success, and error states.
- Loading experience:
  - subtle animated gradient/hue shift in preview area
  - randomized loading messages
  - content-aware loading messages based on prompt keywords
- Input auto-clears on submit.
- Previous generated preview remains visible while loading next change.
- Projects tab currently shows "Projects: coming soon."

### Backend

- `POST /api/generate` route in `api/generate.ts`.
- Primary model route:
  - OpenRouter key + DeepSeek Reasoner (`deepseek/deepseek-r1`).
- Fallback route:
  - Groq key + configurable Groq model.
- Strict prompting policy to avoid overbuilding:
  - only do requested changes
  - preserve existing content unless explicitly told to remove
  - incremental edits by default
- Backend terminal logs model attempts and final selected model.

### Prompt Context Behavior

- Only typed prompts are kept as context.
- Generated code is not stored as history.
- Prompt history is in-memory only (not persisted).
- Refresh resets context, so a fresh page load starts fresh.

## Tech Stack

- React 19
- TypeScript
- Vite
- Vercel serverless functions (`@vercel/node`)
- OpenRouter API
- Groq API (fallback)
- Lucide React icons

## Project Structure

```text
api/
  generate.ts            # Serverless generation endpoint
src/
  App.tsx                # Main UI + prompt flow + preview renderer
  App.css                # UI styling + loading animation
  main.tsx               # App bootstrap
docs/
  mvp-action-plan/
    README.md
    PHASE-1-2-IMPLEMENTATION.md
```

## Environment Variables

Create a `.env` file in the project root.

```bash
OPENROUTER_API_KEY="YOUR_OPENROUTER_KEY"
OPENROUTER_PRIMARY_MODEL="deepseek/deepseek-r1"
GROQ_API_KEY="YOUR_GROQ_KEY"
GROQ_FALLBACK_MODEL="llama-3.1-8b-instant"
```

Notes:

- If `GROQ_API_KEY` is missing, fallback provider is unavailable.
- Keep `.env` private and never commit it.

## Local Development

Install dependencies:

```bash
npm install
```

Run full app (frontend + serverless API) locally:

```bash
npx.cmd vercel dev --listen 3000
```

Open:

```text
http://localhost:3000
```

Why `npx.cmd` on Windows:

- On PowerShell with restricted execution policy, `npx` may fail.
- `npx.cmd` avoids that script-policy issue.

## Build

```bash
npm run build
```

## Quick Deploy (Fastest Path)

### Option A: Vercel Dashboard (Easiest)

1. Push project to GitHub.
2. In Vercel, click **Add New Project**.
3. Import the repo.
4. Set environment variables in project settings:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_PRIMARY_MODEL` (optional override)
   - `GROQ_API_KEY`
   - `GROQ_FALLBACK_MODEL` (optional override)
5. Deploy.

### Option B: Vercel CLI (Fast CLI Flow)

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

When prompted:

- Link to existing project or create a new one.
- Configure env vars in Vercel project settings (or with `vercel env add`).

## Deploy Checklist

- `OPENROUTER_API_KEY` set
- `GROQ_API_KEY` set
- Build succeeds locally (`npm run build`)
- `vercel dev` works locally
- Production URL tested with:
  - basic prompt
  - iterative prompt
  - fallback scenario

## Troubleshooting

### `/api/generate` returns error in local dev

- Make sure you are running `npx.cmd vercel dev --listen 3000` and not just `npm run dev`.

### Fallback not working

- Verify `GROQ_API_KEY` is set.
- Verify `GROQ_FALLBACK_MODEL` is valid for your Groq account.

### Model overbuilds output

- Prompt policy is strict in backend, but LLM behavior can vary.
- Use explicit requests such as: "Only add a black header with white text. Do not add anything else."

## Documentation

- Detailed implementation log:
  - `docs/mvp-action-plan/PHASE-1-2-IMPLEMENTATION.md`
- MVP action plan:
  - `docs/mvp-action-plan/README.md`
