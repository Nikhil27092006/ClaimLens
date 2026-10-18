# ClaimLens — Frontend Build Prompt for Claude Code

How to use this file:

1. Put this file in your repo at `docs/FRONTEND_BUILD_PROMPT.md`, and put the six design files in `docs/design-reference/`.
2. Start Claude Code in the repo and paste the **Master prompt** below.
3. Run **one phase per session**. When a phase ends, check the result yourself, commit, then tell Claude Code: `Start Phase N`.

---

## Master prompt (paste this first, every session)

```text
You are building the frontend of ClaimLens, our entry for the Nebius × NVIDIA Global AI Hackathon
(submission deadline: Oct 30, 2026). Read docs/FRONTEND_BUILD_PROMPT.md fully before writing code.
It contains the product context, the finalised visual design, the API contract and the phases.

Rules for this whole project:
- Work on ONE phase at a time. Only start the phase I name. At the end of each phase, stop and give me:
  (1) what you built, (2) files created/changed, (3) how to run and check it, (4) anything you
  could not do or decided on my behalf.
- The visual design is FINAL. The reference is docs/design-reference/*.dc.html. Those files are design
  mockups in a special template format ({{holes}}, <sc-for>, <sc-if>, <x-dc>); do NOT run or copy that
  template syntax. Read them as a visual spec: copy the exact colours, fonts, spacing, borders, copy text,
  layout and hierarchy into real React components.
- Do not invent a different look. No rounded "SaaS" cards, no gradients, no purple, no Inter/Roboto, no emoji.
- TypeScript strict mode. No `any` unless commented why.
- Every screen must work against the mock API (MSW) before the real backend exists, and switch to the
  real backend with one env variable.
- Accessibility is part of "done": real buttons/links/labels, visible focus, 4.5:1 text contrast,
  keyboard reachable, aria-live for streaming progress.
- Keep dependencies minimal; ask before adding anything not listed in this file.
- Run `npm run lint`, `npm run typecheck` and `npm test` before you say a phase is done.

Now confirm you have read the file and the six design references, summarise the plan in 10 lines,
and wait for me to say "Start Phase 0".
```

---

## 1. Product context

ClaimLens checks research claims against the scientific literature. Two modes:

- **Claim mode (hero):** the user pastes a claim. The backend agent searches Semantic Scholar, arXiv and Tavily, downloads papers, and judges the claim with NVIDIA Nemotron (served on Nebius Token Factory). The UI shows a verdict, the supporting and contradicting evidence (exact quotes + page numbers), and a live **agent trace** of every step.
- **Upload mode:** the user uploads 2–5 PDFs, then can **Ask** questions (answers with citations), **Compare** papers in a table, or find **Contradictions** between them.

Every quote shown has been verified on its page by the backend. The UI must make that trust visible: quote → page → open the PDF at that page with the sentence highlighted.

My role: I own the frontend, the FastAPI backend and the APIs. The ML team owns the `ai/` pipeline.

## 2. Tech stack (decided — do not change)

| Concern | Choice |
| --- | --- |
| Build | Vite + React 18 + TypeScript (strict) |
| Routing | React Router v6 |
| Server state | TanStack Query v5 |
| Styling | Tailwind CSS v3, with the design tokens below in `tailwind.config.ts` + CSS variables |
| PDF viewer | `react-pdf` (pdf.js) with the text layer on |
| Mock API | MSW v2 (browser worker in dev, node in tests) |
| API types | `openapi-typescript` once the backend is up; hand-written types in `src/api/types.ts` until then |
| Tests | Vitest + React Testing Library; one Playwright smoke test at the end |
| Lint/format | ESLint (typescript-eslint, react-hooks, jsx-a11y) + Prettier |

Env variables (`.env.example`):

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_USE_MOCKS=true
VITE_ENABLE_CLAIM_MODE=true
VITE_ENABLE_FETCH_BY_LINK=false
```

## 3. Design system (copy exactly)

The concept is an **evidence desk**: a researcher's lab notebook crossed with a fact-checker's desk. It uses a graph-paper background, ink rules, square corners and mono labels. There is ONE accent, a highlighter yellow, which is also the mark used for highlighted evidence.

### Colours

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#EDEFE9` | App background |
| `grid` | `#DFE2DA` | Graph-paper lines (24px grid) |
| `sheet` | `#FBFBF8` | Cards, header, inputs |
| `sheet-2` | `#F4F5F0` | Sub-bands inside cards ("Why" row) |
| `ink` | `#121412` | Text, borders, dark panels, primary buttons |
| `ink-2` | `#2A2E29` | Body copy on sheet |
| `muted` | `#4A4F49` | Secondary text, mono labels |
| `muted-on-ink` | `#8E948A` / `#B9BEB4` | Secondary text on dark panels |
| `rule` | `#CDD1C8` | Table row dividers |
| `rule-dashed` | `#9BA196` | Dashed separators, chip borders |
| `marker` | `#DDF24A` | Highlighter: `<mark>`, active nav text, CTA on ink, demo button |
| `support` | `#1F4ED8` | Supports / Supported / citation numbers |
| `support-tint` | `#E3EAFB` | Citation chip background |
| `contra` | `#B93A0A` | Contradicts / Contradicted / failed |
| `partial` | `#8A5E00` (text), `#C9A227` + `#9A6A00` (hatch) | Partially supported |
| `insufficient` | `#6B7068` | Insufficient evidence (dashed border) |

Graph-paper background on the app root:
`background-color:#EDEFE9; background-image:linear-gradient(#DFE2DA 1px,transparent 1px),linear-gradient(90deg,#DFE2DA 1px,transparent 1px); background-size:24px 24px;`
Dark panels (agent trace, evidence viewer, login left side) use `ink` with a `#20251F` grid.

### Typography (Google Fonts)

| Role | Font | Notes |
| --- | --- | --- |
| Display / headings | **Bricolage Grotesque** 700/800 | Tight tracking (−0.5 to −2px). H1 48px, verdict 64px, claim text 36px |
| UI / body | **Hanken Grotesk** 400–700 | Body 15–17px, line-height 1.5–1.65 |
| Labels / data / IDs | **JetBrains Mono** 400–600 | 11–13px, UPPERCASE + 0.6px tracking for section labels |
| Evidence quotes | **Newsreader** italic 400 | 17–18px; every quote from a paper uses this |

### Shape and component rules

- Corners are **square** (radius 0) everywhere. No pill shapes.
- Borders: cards `1.5px solid ink` (major) or `1px solid ink` (evidence cards); dashed `1.5px dashed` for drop zones and "partial" cards.
- Shadows: only the hard offset shadow `4px 4px 0 ink` on the demo CTA and `8px 8px 0 marker` on the PDF page. No blur shadows.
- Status is never shown by colour alone:
  - Supported → solid blue tag/square
  - Contradicted → solid orange tag/square
  - Partial → hatched pattern (`repeating-linear-gradient(135deg,#C9A227 0 6px,#FBFBF8 6px 10px)`) or outlined amber tag
  - Insufficient → dashed grey outline tag
- Highlight = `<mark>` with marker background, ink text, `0 3px` padding.
- Citations: mono, e.g. `[2 · p.8]` on a support-tint background, or `[n]` in support blue on cards.
- Buttons:
  - **Primary:** ink background, marker text (on light) or sheet text.
  - **Secondary:** transparent, 1.5px ink border.
  - **Demo CTA:** marker background, ink border, hard shadow.
  - All buttons are min 44px tall.
- Header (all app screens):
  - Left: logo — a square mark plus the wordmark "Claim" with "Lens" on marker.
  - Mono uppercase nav `01 Check · 02 Library · 03 Ask · 04 Compare · 05 Conflicts`. The active item is an ink block with marker text.
  - Right: a model status ("Nemotron 3 · Token Factory" with a blue square) and an account square button.
  - Bottom edge: a 1.5px ink rule.
- Layout: `max-width:1320px`, `padding:32px`, 24px gaps. Below 768px everything stacks, the nav wraps, and tables scroll horizontally inside their box.

### Screens (one design file each)

| Route | Design file | Key parts |
| --- | --- | --- |
| `/login` | `Login.dc.html` | Dark left half with the headline "Don't trust the claim. Read the evidence." and a tilted example result card stamped CONTESTED. Right half: "Try the live demo — no account" CTA, email + password, GitHub/Google buttons |
| `/` (Check) | `Main.dc.html` | Claim box (36px display textarea + Re-check), source chips, Verdict band (big word + verdict meter + 3 counts), Supports / Contradicts columns of evidence cards, partial card, dark Agent trace rail with verified-quotes footer |
| `/library` | `Library.dc.html` | Title row with "Compare selected" + "Ask across N papers", split drop zone (upload / fetch by link), papers table with checkbox, source, pages, status (ready / indexing with progress bar / failed + retry) |
| `/ask` | `Ask.dc.html` | Scope chips, question as display heading, answer card with inline citations + "Claims in this answer" list with status tags + confidence, follow-up composer; right dark Evidence viewer with PDF page, highlighted sentence, page nav, "✓ quote found on page" |
| `/compare` | `Compare.dc.html` | Summary line with marked differences, "Highlight differences" toggle, Export CSV, attribute × paper table, every cell links to its page, "differs" marker on rows |
| `/conflicts` | `Contradictions.dc.html` | Filter segmented control, conflict cards: id + topic + status tag, quote A ≠ quote B (ink divider with marker ≠), "Why" row with factor tags |

Remove the "Sample data…" footnotes from the design in the real app.

## 4. API contract (backend: FastAPI, base `/api/v1`)

Error shape for every non-2xx: `{ "error": { "code": string, "message": string } }`.
Codes: `INVALID_REQUEST 400`, `NOT_FOUND 404`, `DOCUMENT_NOT_READY 409`, `FILE_TOO_LARGE 413`, `UNSUPPORTED_TYPE 415`, `RATE_LIMITED 429`, `UPSTREAM_ERROR 502`, `INTERNAL_ERROR 500`.

| Method + path | Request | Response |
| --- | --- | --- |
| `GET /health` | — | `{status, version, mock_ai}` |
| `POST /upload` | multipart `files` (1–5 PDFs, ≤25 MB each) | `202` `[{document_id, filename, status:"processing"}]` |
| `GET /documents` | `?status=` | `Document[]` |
| `GET /documents/{id}` | — | `{document_id, status, pages, chunks, sections[], error}` (poll every 2s while processing) |
| `DELETE /documents/{id}` | — | `204` |
| `GET /documents/{id}/file` | — | PDF bytes |
| `POST /documents/fetch` *(proposed, behind `VITE_ENABLE_FETCH_BY_LINK`)* | `{url}` | `202 Document` |
| `POST /query` | `{question, document_ids[]}` | `202 {job_id}` |
| `POST /compare` | `{document_ids[], attributes?[]}` | `202 {job_id}` |
| `POST /contradiction` | `{document_ids[], topic?}` | `202 {job_id}` |
| `POST /check` | `{claim, max_papers?}` | `202 {job_id}` |
| `GET /jobs/{id}/stream` | SSE | events `step` `{type, message, via?, t?}`, then `done` `{result}` or `error` `{error}` |
| `GET /jobs/{id}` | — | `{job_id, kind, status:"running"|"done"|"error", result?, error?}` |
| `GET /chunks/{chunk_id}` | — | `{chunk_id, document_id, page, section, text}` |

Step types in order: `searching`, `processing` (check only), `retrieving`, `reranking`, `reasoning`, `validating`.

Data models (`src/api/types.ts`):

```ts
type DocStatus = 'processing' | 'ready' | 'failed';
type ClaimStatus = 'SUPPORTED' | 'PARTIALLY_SUPPORTED' | 'CONTRADICTED' | 'INSUFFICIENT_EVIDENCE';
interface Document { document_id: string; title: string; filename: string; authors?: string; year?: number;
  pages: number; chunks?: number; status: DocStatus; source: 'upload' | 'search' | 'link'; url?: string;
  progress?: number; error?: string | null; uploaded_at: string; }
interface Evidence { chunk_id: string; document_id: string; page: number; section?: string; quote: string; }
interface Claim { claim: string; status: ClaimStatus; confidence: number; evidence: Evidence[]; }
interface QueryResult { answer: string; claims: Claim[]; }            // answer text contains [n] markers mapped to claims/evidence
interface CompareRow { attribute: string; values: Record<string, { value: string; chunk_id: string; page?: number }>; }
interface Contradiction { id: string; topic: string; status: ClaimStatus;
  claim_a: { text: string; chunk_id: string; document_id: string; page: number };
  claim_b: { text: string; chunk_id: string; document_id: string; page: number };
  explanation: string; factors?: string[]; }
interface CheckResult { claim: string; papers: Document[];
  supports: Evidence[]; contradicts: Evidence[]; partial: Evidence[]; insufficient: Evidence[];
  summary: string; verified_quotes: number; total_quotes: number; }
interface JobStep { type: string; message: string; via?: string; t?: number; }
```

Verdict label is computed in the frontend from `CheckResult`:
- only supports → **Supported.**
- only contradicts → **Refuted.**
- both → **Contested.**
- neither → **Not enough evidence.**

---

## 5. Phases

Each phase ends with **acceptance criteria**. Do not move on until they pass.

### Phase 0 — Project setup and app shell
1. Scaffold Vite + React + TS in `frontend/`. Add the stack from §2, ESLint/Prettier, path alias `@/` → `src/`, and the npm scripts `dev`, `build`, `preview`, `lint`, `typecheck`, `test`.
2. Folder structure:
   ```
   src/
     app/        (router, providers, layout)
     api/        (client, types, hooks, sse)
     mocks/      (msw handlers, fixtures)
     components/ (design-system primitives)
     features/   (check/, library/, ask/, compare/, conflicts/, auth/)
     styles/     (tokens.css, fonts)
     lib/        (utils)
   ```
3. Load the four Google Fonts. Put the tokens from §3 into `tokens.css` as CSS variables and into `tailwind.config.ts`. Set Tailwind `borderRadius` defaults to 0.
4. Router with all six routes, plus `AppLayout` (graph-paper background + `AppHeader`) for every route except `/login`. Each route renders a titled placeholder.
5. `.env.example` and a README section on running the frontend.

**Acceptance:**
- `npm run dev` shows the header, and navigating between the 6 routes works.
- The active nav state matches the design.
- Fonts and the graph-paper background match `Main.dc.html` side by side.
- Lint, typecheck and test all pass.

### Phase 1 — Design-system components
Build these in `src/components/`, each with typed props and a Vitest render test. Add a `/_kit` dev-only route that shows them all, like a mini Storybook.

- `Button` (primary / secondary / marker-cta / ghost-on-ink; sizes; loading state)
- `TextInput`, `TextArea` (with visible labels), `Checkbox`, `SegmentedControl`
- `SectionLabel` (mono uppercase)
- `Mark` (highlighter)
- `Quote` (Newsreader italic; accepts `pre/highlight/post`, or highlights a substring)
- `CitationChip` (`[2 · p.8]`, clickable)
- `StatusTag` (4 claim statuses, colour + shape)
- `DocStatus` (ready / indexing with progress / failed + retry)
- `Card` (sheet + ink border variants, dashed variant)
- `DarkPanel`
- `VerdictMeter` (segments for support / partial / contradict; partial hatched; `role="img"` + aria-label with counts)
- `VerdictBand`
- `EvidenceCard`
- `TraceList` (timestamped steps, mono)
- `PdfPagePlaceholder`
- `Skeleton` (square blocks, no shimmer gradient — use a subtle opacity pulse; respect `prefers-reduced-motion`)
- `EmptyState`, `ErrorBanner`
- `AppHeader`, `Logo`

**Acceptance:**
- `/_kit` matches the design references.
- Every component is keyboard-focusable where interactive, with a visible focus ring (2px marker outline + 2px ink offset).
- No hard-coded hex outside the token files.

### Phase 2 — API layer and mock server
1. `src/api/client.ts`: a fetch wrapper with the base URL from env. It parses the error shape into a typed `ApiError` and uses `AbortController` support.
2. `src/api/sse.ts` + hook `useJobStream(jobId)` built on `EventSource`. It returns `{steps, status, result, error}`, handles `step` / `done` / `error` events, and closes on unmount. It falls back to polling `GET /jobs/{id}` every 2s if SSE fails.
3. TanStack Query hooks:
   - `useDocuments`
   - `useDocument(id)` (polls while processing)
   - `useUpload` (multipart, with per-file progress via XHR)
   - `useDeleteDocument`
   - `useStartQuery`, `useStartCompare`, `useStartContradiction`, `useStartCheck`
   - `useChunk(id)`
4. MSW handlers for EVERY endpoint in §4. They use realistic fixtures built from the sample content in the design files (fictional paper titles), stream SSE steps with delays of 300–900 ms, and have a toggle to simulate an error and a slow response.
5. Turn on MSW when `VITE_USE_MOCKS=true`.

**Acceptance:**
- Unit tests cover the client error parsing and `useJobStream` (step → done, error, unmount cleanup).
- With mocks on, a test page can start a `/check` job and log streamed steps.

### Phase 3 — Login and demo mode
1. `/login` exactly as `Login.dc.html`. The left panel is decorative; the example card is static markup.
2. Auth is a stub for the hackathon:
   - "Try the live demo — no account" sets `session = {mode:'demo'}` and goes to `/`.
   - Email/password and the GitHub/Google buttons are visible. They call a `signIn()` stub that shows "Accounts are coming soon — use the demo" in an inline message, not an alert.
   - Store the session in `sessionStorage`. A route guard sends unauthenticated users to `/login`.
3. The left panel hides below 900px; the form stays usable on a phone.

**Acceptance:**
- The page matches the design.
- The demo button works with the keyboard.
- The guard redirects correctly.

### Phase 4 — Library
1. Title row: "Compare N selected" and "Ask across N papers" are disabled until 2+ ready papers are selected. They navigate to `/compare?docs=…` and `/ask?docs=…`.
2. Drop zone:
   - Drag and drop or click, with a hidden file input and an accessible label.
   - Client-side checks before upload: PDF only, ≤5 files, ≤25 MB each. Show errors inline in the zone.
   - Per-file upload progress.
3. "Fetch by link" half: rendered only when `VITE_ENABLE_FETCH_BY_LINK=true`; otherwise the upload half takes the full width.
4. Papers table:
   - Columns: checkbox, Paper (title + authors · year in mono), Source, Pages, Status, Added (relative time).
   - Processing rows show the indexing bar and poll.
   - Failed rows show "retry with OCR" (calls upload again or shows a TODO toast if the backend has no retry yet).
   - Each row has a delete action behind a confirm dialog.
   - Selection is kept in the URL (`?sel=DOC001,DOC002`).
5. Empty state when there are no papers. Use the dashed-zone styling, not an illustration.

**Acceptance:**
- Uploading 2 PDFs with mocks shows processing → ready.
- Validation errors are announced to screen readers.
- The table scrolls horizontally on mobile.

### Phase 5 — Claim check (the hero screen)
1. Claim box: a 36px display textarea, a "Re-check claim →" primary button, and "Edit sources" (a popover with checkboxes for Semantic Scholar / arXiv / Tavily and max papers 3–10). Submit with ⌘/Ctrl+Enter.
2. On submit, call `POST /check`, then `useJobStream`:
   - The **Agent trace** rail fills step by step as SSE arrives (`aria-live="polite"`) with elapsed time in mono, e.g. `03.1s`.
   - The verdict band shows a skeleton until `done`.
3. On `done`:
   - Source chips show counts per source and "N papers read in full".
   - Verdict band: the computed label (§4), the summary with `<mark>` on the key phrase if the backend sends one (else no mark), the VerdictMeter, and three counts.
   - Supports and Contradicts columns of `EvidenceCard`s, each with title, `[n]`, a quote with the highlighted span, `p. X · §section`, and "Open page →". Partial evidence goes in the dashed amber card; insufficient goes in a collapsed list.
   - The trace footer reads "N / N quotes verified on page."
4. "Open page →" opens the Evidence viewer (from Phase 6) as a right-side drawer on this screen, at that document and page. Until Phase 6 exists, link to `/ask?doc=…&page=…`.
5. Keep the last 5 checks in `sessionStorage` and show them as a "Recent checks" row under the claim box.
6. The screen is hidden when `VITE_ENABLE_CLAIM_MODE=false`; `/` then redirects to `/library`.

**Acceptance:**
- With mocks, the full flow streams in about 6 seconds and ends looking like `Main.dc.html`.
- An error mid-stream shows an `ErrorBanner` with retry, and the trace keeps the steps that were completed.
- It works at 375px wide.

### Phase 6 — Ask + Evidence viewer
1. `/ask?docs=…`:
   - Scope chips for the selected papers, plus "+ add paper" back to the Library.
   - The question history renders as a list of Q (display heading) and answer cards.
2. Answer card:
   - Render the answer text, converting `[n]` markers into `CitationChip`s that link to the evidence.
   - The "Claims in this answer" list shows `StatusTag` + text + confidence (2 decimals).
   - Streaming step labels appear while the job runs.
3. Follow-up composer at the bottom: Enter sends, Shift+Enter makes a new line, and send is disabled while a job runs.
4. **Evidence viewer** (dark panel, reusable component):
   - Header: paper title, authors · year · §section · chunk id.
   - Shows the PDF with `react-pdf` at the cited page, with the text layer on.
   - Finds the quote text in the page's text layer and highlights it with the marker colour plus a 2px ink outline. Normalise whitespace and hyphenation for the match. If no exact match is found, highlight the best fuzzy match and show "≈ approximate match" instead of "✓ quote found on page".
   - Page nav (← p.7 · p.8 / 26 · p.9 →), a close button with aria-label, and Esc to close.
   - The viewer state lives in the URL (`?doc=DOC002&page=8&chunk=DOC002_CH042`) so a citation link can be shared.
   - Lazy-load react-pdf and set up its worker correctly for Vite.
   - Mocks: serve 1–2 small open-licence sample PDFs from `src/mocks/pdfs/`. Ask me to supply them; do not download them yourself.
5. On narrow screens the viewer becomes a full-screen sheet.

**Acceptance:**
- Clicking `[2 · p.8]` opens the viewer at page 8 with the sentence highlighted.
- Esc closes it and focus returns to the citation.

### Phase 7 — Compare and Conflicts
1. `/compare?docs=…`:
   - Starts a `/compare` job with a streaming progress state, then shows the table from `Compare.dc.html`.
   - Paper columns with `[n]` and title.
   - Attribute rows; each cell shows the value plus a mono page link that opens the Evidence viewer drawer.
   - "differs" marker: computed in the frontend by comparing normalised values across columns.
   - "Highlight differences" toggles marker shading on differing rows.
   - "Export CSV" downloads the table client-side.
2. `/conflicts?docs=…`:
   - Starts a `/contradiction` job, then shows conflict cards as in `Contradictions.dc.html`.
   - Segmented filter (All / Contradicted / Partial) with counts and `aria-pressed`.
   - Each quote links to the Evidence viewer.
   - The "Why" row shows the explanation and factor tags.
   - An optional "Narrow by topic" input re-runs the job.
3. Both screens:
   - Empty state when fewer than 2 ready papers are selected, with a link to the Library.
   - Cache results per document set with TanStack Query so switching tabs does not re-run jobs.

**Acceptance:** both screens match their designs with mock data, and every value or quote can be traced to a page in one click.

### Phase 8 — Polish, real backend, tests, deploy
1. Switch to the real backend:
   - Run `openapi-typescript` against `/openapi.json` into `src/api/schema.d.ts`.
   - Make `types.ts` re-export from it, and fix any mismatches. **List every contract difference you find for me; do not silently change the backend contract.**
2. States: every screen has loading (skeleton), empty, error (with retry) and a "backend offline" banner driven by `/health`.
3. Performance:
   - Code-split each route.
   - Lazy-load react-pdf.
   - Preload the display font.
   - Initial JS of the first route under 250 KB gzipped (report the number).
4. Accessibility pass:
   - axe check on every route (add `@axe-core/react` in dev only).
   - Tab-order check.
   - Reduced motion respected.
5. Demo hardening: a `?demo=1` flag that pre-fills the claim box with our best demo claim and pins the three demo papers in the Library.
6. Tests:
   - Component tests from Phase 1 still pass.
   - Add feature tests for the upload validation, the check flow (mock stream) and opening citations.
   - One Playwright smoke test: login demo → check claim → open evidence → close.
7. Docker:
   - Multi-stage `frontend/Dockerfile` (node build → nginx serving `dist/`).
   - nginx config with SPA fallback, `/api` proxied to the backend service, and SSE-friendly proxy settings (`proxy_buffering off`).
   - Add the service to the root `docker-compose.yml`.
8. README: setup, env vars, scripts, how mocks work, screenshots of each screen.

**Acceptance:**
- The full demo flow works against the real backend in Docker.
- Lighthouse accessibility ≥ 95 on `/` and `/library`.
- All tests pass.

---

## 6. Definition of done (every phase)
- Matches the design reference at 1440px and works at 375px.
- No console errors or React key warnings.
- Lint, typecheck and tests pass.
- Phase summary given (built / files / how to check / open questions).
