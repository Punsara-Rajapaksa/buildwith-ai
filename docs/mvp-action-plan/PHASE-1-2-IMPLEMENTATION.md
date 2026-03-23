# Phase 1 + Phase 2 (Core Path) Implementation Notes

## Purpose
This document records, in detail, exactly what was implemented for:
- Part 1: Connect frontend prompt submission to backend generation endpoint.
- Part 2: Render returned HTML as a live preview in a sandboxed iframe.

This keeps the MVP focused on one demo loop:
User types prompt -> clicks Generate -> sees working preview.

## Files Updated
- src/App.tsx
- src/App.css

## Detailed Changes

### 1) Frontend API wiring in src/App.tsx

#### Added response typing
A local type named `GenerateResponse` was added to safely describe server response fields:
- `success?: boolean`
- `code?: string`
- `error?: string`
- `details?: string`

Why:
- Prevents loosely-typed JSON access.
- Makes frontend response handling explicit.

#### Added new component state
Three states were introduced:
- `generatedHtml` to store AI-generated HTML string.
- `errorMessage` to display request/validation errors.
- `isLoading` to track submit progress.

Why:
- Required to support async generation, result rendering, and clear user feedback.

#### Replaced submit handler with async flow
`handleSubmit` now:
1. Prevents default form submit.
2. Trims user prompt.
3. Rejects empty prompt and sets `errorMessage`.
4. Sets loading state and clears prior errors.
5. Sends `POST /api/generate` with JSON body `{ prompt }`.
6. Parses JSON response.
7. Throws a readable error if response is not ok or if `code` is missing.
8. Stores returned code in `generatedHtml` on success.
9. Catches and displays any error message.
10. Always clears loading state in `finally`.

Why:
- Delivers a complete end-to-end frontend-to-backend request path.
- Ensures failures are visible and recoverable.

#### Added live preview conditional rendering
The preview area now renders:
- A sandboxed iframe when `generatedHtml` exists.
- Original placeholder block when no generated code exists.

Iframe details:
- `srcDoc={generatedHtml}` for direct in-memory rendering.
- Sandbox enabled with:
  - `allow-forms`
  - `allow-modals`
  - `allow-pointer-lock`
  - `allow-popups`
  - `allow-scripts`

Why:
- Creates immediate visual feedback after generation.
- Keeps generated code isolated from app shell.

#### Updated input/button interaction states
- Prompt input is disabled while loading.
- Generate button is disabled while loading.
- Button label swaps to `Generating...` during requests.
- Error message block appears below the form when needed.

Why:
- Prevents duplicate submits.
- Gives clear feedback during async operations.

### 2) Preview + error styling in src/App.css

#### Updated preview canvas container
- Added `overflow: hidden` to keep iframe clipped within rounded preview box.

Why:
- Ensures rendered page stays visually contained.

#### Added iframe styles
New `.preview-frame` style:
- `width: 100%`
- `height: 100%`
- `border: 0`
- `background: #fff`

Why:
- Makes iframe fill preview canvas cleanly with no default border artifacts.

#### Added error message style
New `.error-message` style:
- Top margin for spacing
- High-contrast red text
- Small readable size

Why:
- Keeps validation/API errors visible but unobtrusive.

## Request/Response Data Flow (After Changes)
1. User enters prompt in input.
2. User submits form.
3. Frontend posts prompt to `/api/generate`.
4. Backend (`api/generate.ts`) forwards prompt to OpenRouter.
5. Backend returns cleaned HTML in JSON field `code`.
6. Frontend stores `code` in `generatedHtml`.
7. Iframe renders `generatedHtml` via `srcDoc`.

## What Is Now Complete
- Part 1 complete: frontend submit now connected to backend API.
- Part 2 complete: backend output is now rendered in a live iframe preview.

## Manual Verification Steps
1. Run app locally.
2. Enter prompt like: `Create a red button with a hover effect`.
3. Click Generate.
4. Confirm button switches to `Generating...`.
5. Confirm preview area updates with generated page.
6. Submit empty prompt and confirm inline validation message.
7. Simulate backend failure and confirm readable error appears.

## Notes for Next Iteration
- Optional next layer: more polished loading UI (skeleton/spinner in preview).
- Optional next layer: normalize backend error payload further for cleaner messages.
- Optional next layer: add a small "Regenerate" UX and last-success timestamp.

---

# Phase 3 + Phase 4 Implementation Addendum

## Purpose
This addendum records, in detail, exactly what was implemented for:
- Part 3: Required UX states.
- Part 4: Stable backend response shape and error normalization.

## Files Updated (Phase 3 + 4)
- src/App.tsx
- src/App.css
- api/generate.ts

## Part 3: UX State Completion

### Frontend state and UX messaging upgrades in src/App.tsx

Added state:
- `statusMessage`
- `statusTone` (`neutral | success | error`)

Added behavior:
1. Empty prompt now sets both inline error and status message, then re-focuses input.
2. Loading state sets explicit status text: "Generating your preview...".
3. Success state sets explicit status text: "Preview updated successfully.".
4. Failure state sets retry guidance: "Generation failed. Update your prompt and try again.".
5. Example chips and refresh icon are disabled while loading to avoid conflicting actions.
6. Fetch response parsing now safely handles non-JSON responses.

Why:
- Guarantees user-facing state clarity across idle/loading/success/error.
- Prevents duplicate or conflicting UI interactions during active requests.

### UX styling upgrades in src/App.css

Added styles:
- Disabled Generate button visual treatment.
- `.status-message` plus status variants (`.status-neutral`, `.status-success`, `.status-error`).
- Disabled visual states for sample chips and refresh icon.

Why:
- Makes state transitions visible and understandable during the demo.

## Part 4: Backend Response Stabilization

### Response shape normalization in api/generate.ts

All responses now follow one of these shapes:

Success:
```json
{
  "success": true,
  "code": "<html...>",
  "error": null,
  "details": null
}
```

Error:
```json
{
  "success": false,
  "code": null,
  "error": "Human-readable summary",
  "details": "Additional context or null"
}
```

Implementation details:
1. Added helper functions `sendSuccess` and `sendError`.
2. Method and validation errors now return normalized payloads.
3. Missing API key errors now include setup guidance.
4. OpenRouter non-2xx responses parse JSON or text and normalize error details.
5. Added guard for empty model output (`502 Model returned empty code`).
6. Preserved markdown code-fence cleanup.

Why:
- Frontend can reliably parse and display every backend outcome.
- Demo failures become understandable and recoverable.

## Validation Notes (Post Part 3 + 4)
Recommended checks:
1. Submit valid prompt and verify success status + iframe render.
2. Submit empty prompt and verify error status + focus behavior.
3. Simulate invalid API key and verify normalized backend error.
4. Confirm loading lock prevents duplicate submissions.

---

# Model Routing Update: DeepSeek Reasoner + Fallback

## Purpose
Configure the backend to use DeepSeek Reasoner first, automatically fail over to a fallback free model, and expose model usage in API + UI.

## Files Updated
- api/generate.ts
- src/App.tsx
- src/App.css

## Backend Changes

### Primary/fallback model order
Implemented model order:
1. Primary: `deepseek/deepseek-r1`
2. Fallback provider/model: `groq:llama-3.1-8b-instant`

Both can be overridden by environment variables:
- `OPENROUTER_PRIMARY_MODEL`
- `GROQ_API_KEY`
- `GROQ_FALLBACK_MODEL`

### Failover behavior
Backend now attempts models in order until one succeeds.
- If primary fails (upstream error or empty output), Groq fallback is attempted.
- If all models fail, a normalized error is returned.

### Response shape enhancement
Success and error responses now include model metadata:
- `modelUsed`: final successful model or `null` when all fail
- `attemptedModels`: array of tried models in order

## Frontend Changes

### Model visibility in UI
Frontend now reads and displays:
- Current model (`modelUsed`) after success
- Attempt chain (`attemptedModels`) for transparency and debugging

### UX impact
- During/after generation, user can see exactly which model produced output.
- On failure, attempted model chain helps quickly verify fallback behavior.

---

# UX + Prompting Refinement Update

## Purpose
Apply final behavior constraints for demo quality:
- Hide model info in frontend.
- Show model usage in backend terminal logs only.
- Add subtle loading animation with prompt-aware dynamic loading text.
- Enforce minimal, incremental edits so results do only what was requested.

## Files Updated
- src/App.tsx
- src/App.css
- api/generate.ts

## Frontend Updates

### Removed model visibility from UI
- Removed current/attempted model line from the UI.
- Frontend no longer presents provider/model metadata to end users.

### Dynamic loading text based on prompt
- Added prompt-to-loading-message generation, for example:
  - "Planning navigation bar"
  - "Applying only the requested change"
  - "Preserving your existing design"
  - "Rendering updated preview"
- Rotates through these messages while generation is in progress.

### Subtle generation animation
- Added a subtle hue-shift animation to the preview container while loading.
- Added a translucent loading overlay inside the preview area with the active dynamic loading text.

### Incremental edit payload
- Frontend now sends `currentHtml` with each prompt.
- This gives the backend/model the existing page context so new prompts build on top of prior output.

## Backend Updates

### Model reporting moved to backend terminal
- Added backend logs:
  - `Model attempt started: ...`
  - `Model used: ...`
- This keeps model visibility in server logs without exposing it in frontend UI.

### Strict minimal-edit prompting
- Updated system instructions to enforce:
  - Do only explicitly requested changes.
  - Avoid extra components/content.
  - Preserve existing content unless explicitly told to remove.
  - Treat new prompts as incremental edits.
- Added context-aware user prompt builder:
  - Uses prompt history context for reference resolution.
  - Applies current request as minimal incremental update.

---

# Comprehensive Status Snapshot (Current)

## Core MVP Delivered
1. Prompt input to backend API generation flow is functional.
2. Generated HTML is rendered instantly in sandboxed iframe preview.
3. Idle/loading/success/error UX states are implemented.
4. Backend response shape is normalized for success/failure.
5. Model routing uses DeepSeek Reasoner primary with Groq fallback.

## Backend Architecture (Current)
1. Endpoint: `POST /api/generate`.
2. Primary provider/model:
  - OpenRouter + `deepseek/deepseek-r1`.
3. Fallback provider/model:
  - Groq + configurable fallback model.
4. Model attempts and final model choice are logged in backend terminal.
5. Error handling includes upstream payload extraction and normalized API responses.

## Prompting Strategy (Current)
1. System prompt enforces strict minimal edits.
2. System prompt explicitly blocks overbuilding and unrelated additions.
3. Cumulative behavior is default unless remove/replace is explicitly requested.
4. Ambiguous references (for example: "that", "it", "same") are resolved from prompt history.

## Context Strategy (Current)
1. Frontend stores only typed prompts (not generated HTML/code) in localStorage.
2. Prompt history key: `buildwithai.promptHistory.v1`.
3. History limit: last 24 prompts.
4. Frontend sends `promptHistory` with each generation request.
5. Backend uses prompt history to generate context-aware minimal updates.

## Frontend UX (Current)
1. Example prompt chips are dynamic and refreshable.
2. Inputs/chips are safely disabled during active generation.
3. Status text communicates idle/loading/success/error clearly.
4. Loading messages are now:
  - Long-list based.
  - Randomized to avoid repetitive loops.
  - Partially content-aware using prompt keywords.
5. Preview generation visual effect includes:
  - Subtle hue-shift animation.
  - Soft animated gradient background in preview area.
  - Translucent loading overlay with active loading text.

## Security/Operational Notes
1. API keys are read from environment variables.
2. Local development uses `npx.cmd vercel dev --listen 3000` for frontend + serverless API together.
3. Build validation has been repeatedly run after major updates and currently passes.

## Known Functional Tradeoff
1. Using prompt history without full HTML context keeps requests lighter and follows the requirement to avoid sending full generated code every time.
2. Extremely complex structural edits may be less deterministic than full-DOM diff strategies, but behavior now better matches the requested prompt-centric workflow.

---

# Full Detailed Changelog (Everything Completed So Far)

## Product Goal Achieved
Built a demoable AI webpage generator where a user types plain-English instructions and sees a live preview update.

## 1. Frontend Core Delivery
1. Implemented full submit flow from prompt input to backend request.
2. Added robust state management for:
  - loading
  - errors
  - status messaging
  - generated preview HTML
3. Added input validation for empty prompts.
4. Added prompt chips with random refresh behavior.
5. Added submit UX polish (disabled controls while loading).
6. Added prompt-clearing behavior on submit for cleaner iteration flow.

## 2. Live Preview Delivery
1. Rendered generated HTML in sandboxed iframe using `srcDoc`.
2. Preserved placeholder state when no result is available.
3. Ensured preview container clips correctly and remains responsive.

## 3. Loading + Motion Experience
1. Implemented loading overlay inside preview area.
2. Added dynamic loading text system with:
  - large generic message pool
  - keyword-based content-aware variants
  - randomized selection to avoid repetitive loops
3. Slowed loading text cadence for readability.
4. Added subtle premium generation visuals:
  - hue-shift animation
  - soft animated gradient background layer
  - translucent overlay and polished loading pill
5. Tuned overlay transparency so previous preview remains visible during generation.

## 4. Sidebar + Navigation UX
1. Upgraded logo styling to a more polished typographic treatment.
2. Removed logo icon and kept text-only branding as requested.
3. Made `Projects` nav item interactive.
4. Clicking `Projects` now shows: `Projects: coming soon.`

## 5. Backend Reliability + Routing
1. Normalized API response shapes for success and error handling.
2. Added provider failover sequence:
  - primary: OpenRouter DeepSeek Reasoner
  - fallback: Groq model via separate key
3. Added structured model-attempt backend terminal logs.
4. Kept model/provider visibility out of frontend UI.
5. Hardened upstream error extraction and reporting.

## 6. Prompting Behavior Quality Controls
1. Tightened system instructions so model does only requested changes.
2. Enforced incremental update behavior by default.
3. Prevented unrelated additions unless explicitly requested.
4. Preserved existing content unless user explicitly asks to remove/replace.

## 7. Context Memory Behavior (Important)
1. Implemented prompt-history context (typed prompts only, no generated code payload).
2. Prompt history is sent with each request to resolve references like `that` / `it`.
3. Updated behavior to be refresh-fresh:
  - Removed persistent localStorage prompt-history storage.
  - Prompt context now exists only in in-memory React state.
  - Browser refresh now resets context to a clean slate.

## 8. Documentation Updates Completed
1. Updated MVP action plan and implementation notes continuously as features changed.
2. Added complete status snapshots and architecture notes.
3. Added provider-routing and UX refinement records.

## 9. Verification Status
1. Rebuilt project repeatedly after each major change.
2. Current build is passing.
