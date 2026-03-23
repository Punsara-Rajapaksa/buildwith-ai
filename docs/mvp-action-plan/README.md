# BuildWith AI Demo MVP: What's Left To Build

## Demo Goal
User enters a plain-English prompt, clicks Generate, and immediately sees a working webpage preview.

## Keep It Strictly MVP
Do not build these now:
- User accounts.
- Project saving/history.
- Collaboration.
- Multi-page or multi-file generation.
- Complex editor features.

## What Is Already Done
- Frontend shell exists (sidebar, preview container, prompt bar, chips).
- Backend endpoint exists at `api/generate.ts`.
- Backend already calls OpenRouter and returns generated code.

## What Is Left To Build (Core Path)

### 1. Connect frontend to backend (Done)
- Update submit handler in `src/App.tsx` to POST prompt to `/api/generate`.
- Reject empty prompts in UI before calling API.
- Parse response and store generated HTML string in state.

Done when:
- Clicking Generate with a valid prompt calls API and gets response.

### 2. Render live preview (Done)
- Add a sandboxed iframe in the preview area.
- Pass generated HTML into iframe via `srcDoc`.
- Show placeholder only when no generated result exists.

Done when:
- Generated page appears visually in preview and updates on new prompts.

### 3. Add required UX states (Done)
- Add `isLoading`, `errorMessage`, and `generatedHtml` states.
- Disable Generate button while loading.
- Show loading text (Generating...).
- Show clear error message on failure with retry path.
- Show explicit status messaging for idle/loading/success/error.
- Disable example-chip interactions while request is in flight.

Done when:
- User always sees clear status: idle, loading, success, or error.

### 4. Stabilize backend response shape (Done)
- Ensure both success and error responses are consistent JSON.
- Improve error text returned from OpenRouter failures.
- Keep code-fence cleanup for accidental markdown output.

Done when:
- Frontend can always display useful feedback from backend responses.

### 5. Make it demo-ready (Remaining)
- Confirm env var is set: `OPENROUTER_API_KEY`.
- Run local end-to-end test with 5-10 prompts.
- Deploy to Vercel and verify the same flow in production.
- Verify primary model + fallback behavior in UI model indicator.

Done when:
- Shareable URL works with prompt -> generate -> preview loop.

## Priority Order (Build In This Sequence)
1. Frontend submit wiring.
2. Iframe live preview.
3. Loading and error UX.
4. Backend error normalization.
5. Deployment validation.

## Quick Acceptance Checklist
- User can type prompt and click Generate.
- Preview updates with returned HTML/CSS/JS.
- Button/loading states prevent duplicate submits.
- Errors are readable and non-blocking.
- Works on desktop and mobile layout.

## Immediate Next Task
Run final local verification and deploy to Vercel for a shareable demo URL.

## Model Routing (Now Implemented)
- Primary model: `deepseek/deepseek-r1`
- Fallback provider/model: `groq:llama-3.1-8b-instant`
- If primary fails, backend automatically retries with Groq fallback.
- API response now includes:
	- `modelUsed` (model that produced final output)
	- `attemptedModels` (models tried in order)
- Backend terminal logs model attempts and selected model.

## Context + Loading (Now Implemented)
- Frontend stores only typed prompts in localStorage (no generated code history).
- Prompt history is sent with each request for reference-aware updates (for example: "change the color of that").
- Generation loading text now uses a larger randomized set with content-aware variants.
- Preview shows a subtle animated gradient + hue shift while generation is in progress.

### Optional model overrides
- `OPENROUTER_PRIMARY_MODEL` to override primary model.
- `GROQ_API_KEY` to enable Groq fallback.
- `GROQ_FALLBACK_MODEL` to override Groq fallback model.
