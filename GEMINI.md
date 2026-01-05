# Repository Guidelines

## ROLLWISE - AI AGENT INSTRUCTIONS
- Build Rollwise on Vue 3 (Options API) + Vite + Pinia + Vue Router; keep every API mocked.
- UI tone: clean SaaS—Tailwind CSS, 375px-first (max 600px), sticky chrome, 44px+ targets, fast perceived load.
- Business & persuasion: calm residential/commercial clients, call techs “Certified Partners/Network Pros” while the ToS states “independent contractors,” keep Rapid Response default, chain micro-commitments, pulse status dots, surface “Photos are encrypted and only shared with your assigned technician,” and hide client phone numbers until acceptance.

- Pinia stores: `authStore` (phone routing 555-0000 admin, 555-1111 tech, others client; track `techStatus`, `isAuthenticated`), `jobStore` (`status`, `clientType`, `photos`, `triage_bounty`, `triage_diagnosis`), `earningsStore` (balance + transactions).
- Implementation phases: 1) set up `/`, `/login`, `/quick/:id`, `/admin`, `/tech` plus `main.css`. 2) `QuickIntakeView.vue` with location + Use Current, dashed photo drop, Rapid default upsell, card-on-file placeholder, progress/pulsing status. 3) `TechOnboarding.vue` captures license/insurance/equipment, scrollable non-compete, submit ⇒ `techStatus='pending'`. 4) `AdminDashboard.vue` shows Drafts (👋 SMS nudge) and Triage with price/broadcast modal. 5) `TechDashboard.vue` tabs: My Route (navigate + call) and Earn Extra (photo carousel, Diagnose + Estimate inputs, $15 bounty). 6) `TechWalletView.vue` highlights balance hero, “💸 Cash Out” modal (instant vs weekly), labor vs triage cards, transaction history.

## Project Structure & Module Organization
Code lives in `src/` (`main.js`, `App.vue`, router, Pinia stores). Page flows sit in `src/views/`, shared UI in `src/components/`, tokens in `src/assets/main.css`, static assets in `public/`, and builds in `dist/`. Consult the root docs (`TESTING_GUIDE.md`, `REMOTE_TRIAGE_DOCS.md`, etc.) before altering flows.

## Build, Test, and Development Commands
- `npm install` — install Vue/Pinia/rolldown-vite deps.
- `npm run dev` — launch the Vite dev server.
- `npm run build` — compile into `dist/`; `npm run preview` serves that bundle.

## Coding Style & Naming Conventions
Stick to the Vue Options API (`data`, `methods`, `computed`), two-space indentation, and single quotes. Components/stores use PascalCase (`TechDashboard.vue`, `useAuthStore`), routes stay kebab-case.
**We use Tailwind CSS exclusively.** Do not use scoped styles or other CSS frameworks (Bootstrap/Bulma).

## Testing Guidelines
Follow the scenario QA plan in `TESTING_GUIDE.md` and record scenario IDs plus data (e.g., Test 2 with `555-0001`, PIN `1234`) inside each PR. When automated tests arrive, colocate `*.spec.js` next to the component/store and describe coverage goals.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`) with ≤72-character imperative subjects. Every PR must link an issue, summarize UX/architecture impact, attach desktop + mobile evidence for UI work, list manual test steps with scenario IDs/data, and flag follow-ups or backend needs.
