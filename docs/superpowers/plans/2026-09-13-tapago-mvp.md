# TaPago MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an installable, mobile-first SPA for manually tracking diet, ABC strength workouts, walking, and boxing across one 15-day challenge.

**Architecture:** A React SPA holds domain rules in framework-independent `src/domain` modules and exposes persisted challenge state through a React context. An IndexedDB repository stores the single challenge, its progress, and optional PDF references; UI route components consume context actions rather than IndexedDB directly. Static, original exercise illustrations are bundled into the app and selected by an `imageKey`.

**Tech Stack:** React 19, TypeScript, Vite, React Router, Vitest, Testing Library, fake-indexeddb, idb, vite-plugin-pwa, plain CSS.

**Spec:** `docs/superpowers/specs/2026-09-13-tapago-design.md`

## Global Constraints

- Build a static, mobile-first PWA; it must work for normal check-ins without a network connection.
- Persist exactly one active 15-day challenge in IndexedDB; do not add authentication, a server, cloud synchronization, body metrics, videos, or device-health integrations.
- Diet and ABC strength workouts are configured manually; walking and boxing are simple daily check-ins; PDFs are reference-only and never parsed.
- Exercise images must be bundled, original generic person/apparatus illustrations selected from a local catalog; never depend on external image URLs or user-uploaded photos.
- Provide clear validation for incomplete challenge setup, invalid backup files, failed file reads, and exhausted browser storage; preserve saved data on errors.
- Make all primary controls reachable with large touch targets and retain a fixed bottom navigation on mobile.

---

## File Structure

- `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`: Vite, testing and PWA configuration.
- `src/domain/challenge.ts`: domain interfaces, empty challenge factory and all check-in/progress rules.
- `src/domain/challenge.test.ts`: deterministic unit tests for the domain rules.
- `src/data/challengeRepository.ts`: IndexedDB reads/writes and JSON backup validation.
- `src/data/challengeRepository.test.ts`: repository persistence and validation tests using fake IndexedDB.
- `src/assets/exercises/*`: original local exercise illustrations, one per prefilled ABC exercise variation, and their catalog metadata.
- `src/domain/abcTemplates.ts`: exact, editable ABC routine templates that seed the 15-day challenge.
- `src/app/ChallengeContext.tsx`: asynchronous loading, saving, import/export, and user-facing persistence errors.
- `src/app/App.tsx`, `src/app/router.tsx`: application shell and routes.
- `src/components/*`: focused reusable UI pieces: bottom navigation, progress grid, check-in card, exercise card, empty/error states.
- `src/pages/*`: Today, Diet, Workout, Progress, Setup and References route components.
- `src/styles/*.css`: design tokens, global mobile-first styles and component/page styles.

### Task 1: Bootstrap the static PWA and test harness

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `index.html`, `src/main.tsx`, `src/styles/global.css`, `src/test/setup.ts`
- Test: `src/app/App.smoke.test.tsx`

**Interfaces:**
- Produces `npm run dev`, `npm run build`, `npm run test`, and a `registerSW`-enabled application entry point.

- [ ] **Step 1: Write the failing smoke test**

```tsx
import { render, screen } from '@testing-library/react';
import { App } from './App';

it('renders the application title', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: 'TaPago' })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- --run src/app/App.smoke.test.tsx`

Expected: FAIL because the application and test configuration do not exist.

- [ ] **Step 3: Configure Vite, React, Vitest, Testing Library, React Router, idb, fake-indexeddb and vite-plugin-pwa**

Create scripts `dev`, `build`, `test`, and `test:watch`. Configure Vitest with `environment: 'jsdom'` and `setupFiles: ['./src/test/setup.ts']`; configure the PWA manifest with `name: 'TaPago'`, `short_name: 'TaPago'`, `display: 'standalone'`, and theme/background colors matching the dark design. Add an `App` component that renders `<h1>TaPago</h1>`.

- [ ] **Step 4: Run baseline verification**

Run: `npm run test -- --run src/app/App.smoke.test.tsx && npm run build`

Expected: PASS and a generated production bundle.

- [ ] **Step 5: Commit**

```bash
git add package.json vite.config.ts tsconfig.json tsconfig.app.json index.html src
git commit -m "chore: bootstrap tapago pwa"
```

### Task 2: Define and test challenge domain rules

**Files:**
- Create: `src/domain/challenge.ts`, `src/domain/challenge.test.ts`

**Interfaces:**
- Produces `Challenge`, `ChallengeDay`, `Meal`, `WorkoutExercise`, `createEmptyChallenge()`, `toggleMealItem()`, `toggleExercise()`, `toggleDailyCheckin()`, `getDayStatus()`, and `getChallengeProgress()`.
- Consumed by: repository, context, all pages.

- [ ] **Step 1: Write failing domain tests**

```ts
it('marks a workout complete only when every exercise is complete', () => {
  const day = dayWithExercises([false, false]);
  expect(getDayStatus(day).workoutComplete).toBe(false);
  expect(getDayStatus(toggleExercise(day, 'exercise-1')).workoutComplete).toBe(false);
  expect(getDayStatus(toggleExercise(toggleExercise(day, 'exercise-1'), 'exercise-2')).workoutComplete).toBe(true);
});

it('creates exactly fifteen challenge days and calculates completed check-ins', () => {
  const challenge = createEmptyChallenge('2026-09-13');
  expect(challenge.days).toHaveLength(15);
  expect(getChallengeProgress(challenge)).toEqual({ completed: 0, total: 60 });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- --run src/domain/challenge.test.ts`

Expected: FAIL because domain exports do not exist.

- [ ] **Step 3: Implement immutable domain objects and rules**

Use `id` strings for meals, meal items and exercises. A day has `dietManuallyComplete`, `walkingComplete`, `boxingComplete`, meals and strength exercises. `getDayStatus` treats diet as complete when the manual flag is set or every configured meal item is checked; it treats an empty strength workout as incomplete. `getChallengeProgress` sums four daily outcomes across 15 days. All toggle functions return copies and never mutate input.

- [ ] **Step 4: Add edge-case tests and run them**

Add tests for unchecking an item after completion, an empty workout, a day with no meal items, and a manually checked diet. Run: `npm run test -- --run src/domain/challenge.test.ts`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain
git commit -m "feat: add challenge domain rules"
```

### Task 3: Add the ABC routine templates and local illustration catalog

**Files:**
- Create: `src/domain/abcTemplates.ts`, `src/domain/abcTemplates.test.ts`, `src/assets/exercises/catalog.ts`, `src/assets/exercises/placeholder.svg`, and PNG illustrations named `barbell-incline-bench`, `dumbbell-flat-bench`, `peck-deck`, `cable-crossover`, `dumbbell-front-raise`, `seated-plate-front-raise`, `rope-pushdown`, `bar-pushdown`, `reverse-w-bar-pushdown`, `triangle-lat-pulldown`, `bar-lat-pulldown`, `dumbbell-pullover`, `machine-row`, `reverse-peck-deck`, `cable-upright-row`, `barbell-curl`, `hammer-curl`, `concentration-curl`, `barbell-squat`, `leg-press`, `lying-leg-curl`, `dumbbell-sumo-squat`, `leg-extension`, `machine-shoulder-press`, `dumbbell-lateral-raise`, `dumbbell-shrug`, `seated-calf-raise`, `plank`, `single-leg-standing-calf-raise`, `leg-press-calf-raise`, `lying-leg-raise`, and `mat-crunch` in `src/assets/exercises/`.
- Modify: `src/domain/challenge.ts`, `src/domain/challenge.test.ts`
- Test: `src/assets/exercises/catalog.test.ts`, `src/domain/abcTemplates.test.ts`

**Interfaces:**
- Produces `ABC_TEMPLATES: Readonly<Record<'A' | 'B' | 'C', ReadonlyArray<ExerciseTemplate>>>`, `getTemplateForChallengeDay(dayNumber: number)`, `createPrefilledChallenge(startDate: string): Challenge`, `EXERCISE_IMAGES: ReadonlyArray<{ key: string; label: string; src: string }>` and `getExerciseImage(key: string)`.
- Consumed by: challenge factory, setup selector and exercise card.

- [ ] **Step 1: Write the failing catalog tests**

```ts
it('returns a bundled image for a known key and a safe fallback for an unknown key', () => {
  expect(getExerciseImage('leg-press').src).toContain('leg-press');
  expect(getExerciseImage('unknown').key).toBe('placeholder');
});

it('repeats A, B, C for the challenge days without rest days', () => {
  expect(getTemplateForChallengeDay(1)).toBe(ABC_TEMPLATES.A);
  expect(getTemplateForChallengeDay(2)).toBe(ABC_TEMPLATES.B);
  expect(getTemplateForChallengeDay(3)).toBe(ABC_TEMPLATES.C);
  expect(getTemplateForChallengeDay(4)).toBe(ABC_TEMPLATES.A);
});

it('prefills fifteen challenge days from the repeated ABC routine', () => {
  const challenge = createPrefilledChallenge('2026-09-13');
  expect(challenge.days[0].exercises[0].name).toBe('Supino inclinado com barra');
  expect(challenge.days[3].exercises[0].name).toBe('Supino inclinado com barra');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- --run src/assets/exercises/catalog.test.ts`

Expected: FAIL because the catalog is absent.

- [ ] **Step 3: Define the routine and generate the standard illustrations**

In `abcTemplates.ts`, encode the exact routine table below, including the listed sets, repetitions and notes. Add `createPrefilledChallenge(startDate)` to `challenge.ts`; it converts template A/B/C into 15 independent day records using `(dayNumber - 1) % 3`, with all check-ins initially false. Generate one original, non-branded, portrait PNG illustration for every listed exercise key with the same 4:5 canvas, dark graphite background, high-contrast athletic clothing, teal accent, generic apparatus, no text and no brand marks. Use the image-generation skill for these assets; do not fetch assets at runtime. Import every asset into `catalog.ts`; `getExerciseImage` must return `placeholder` for an unknown key.

| Template | Exercise | Prescription / note |
| --- | --- | --- |
| A | Supino inclinado com barra | 2×10, 2×8 |
| A | Supino reto com halteres | 4×12 a 15 |
| A | Peck deck | 2×12, 2×10 |
| A | Cross over | 3×10 |
| A | Elevação frontal com halteres | 4×10 |
| A | Elevação frontal sentado com anilha | 4×8 |
| A | Tríceps na polia com cordas | 3×15 |
| A | Tríceps na polia com barra | 3×15 |
| A | Tríceps supinado com barra W | 3×15 |
| B | Puxada frontal com triângulo | 3×12; breve pausa na contração máxima |
| B | Puxada frontal com barra | 3×15; breve pausa na contração máxima |
| B | Pull over com halter | 3×15 |
| B | Remada articulada | 2×12, 2×10; progressão de carga |
| B | Peck deck invertido | 4×12 |
| B | Remada alta na polia | 4×8 |
| B | Rosca direta com barra | 3×12 |
| B | Rosca alternada hammer | 4×10 cada lado |
| B | Rosca concentrada unilateral | 3×12 |
| C | Agachamento livre | 2×12, 3×10 |
| C | Leg press | 4×15 |
| C | Mesa flexora | 4×12; breve pausa na contração máxima |
| C | Agachamento sumô com halter | 4×10 |
| C | Cadeira extensora | 3×(7+7+7) |
| C | Desenvolvimento articulado | 4×12 |
| C | Elevação lateral com halteres | 3×12 |
| C | Encolhimento de ombros com halteres | 3×15 |
| C | Panturrilhas — flexão plantar no banco | 3×20 |
| C | Prancha frontal | 3×30 s |
| C | Flexão plantar em pé unilateral | 3×15 |
| C | Elevação de pernas | 3×15 |
| C | Flexão plantar no leg press | 3×15 |
| C | Abdominais no colchonet​e | 3×15 |

- [ ] **Step 4: Run tests and production build**

Run: `npm run test -- --run src/assets/exercises/catalog.test.ts && npm run build`

Expected: PASS and all SVGs included in the build.

- [ ] **Step 5: Commit**

```bash
git add src/assets
git commit -m "feat: add offline exercise illustration catalog"
```

### Task 4: Persist one challenge and validate backups

**Files:**
- Create: `src/data/challengeRepository.ts`, `src/data/challengeRepository.test.ts`

**Interfaces:**
- Consumes: `Challenge` from `src/domain/challenge.ts`.
- Produces `loadChallenge(): Promise<Challenge | null>`, `saveChallenge(challenge: Challenge): Promise<void>`, `clearChallenge(): Promise<void>`, `saveReference(file: File): Promise<ReferenceDocument>`, `listReferences(): Promise<ReferenceDocument[]>`, `exportChallenge(challenge: Challenge): string`, `parseChallengeBackup(json: string): Challenge`.
- Consumed by: `ChallengeContext`.

- [ ] **Step 1: Write failing repository tests**

```ts
it('round-trips the active challenge through IndexedDB', async () => {
  const challenge = createEmptyChallenge('2026-09-13');
  await saveChallenge(challenge);
  await expect(loadChallenge()).resolves.toEqual(challenge);
});

it('rejects a backup that does not contain fifteen days', () => {
  expect(() => parseChallengeBackup('{"days":[]}')).toThrow('Backup inválido');
});

it('stores a PDF reference as a local Blob', async () => {
  await saveReference(new File(['pdf bytes'], 'dieta.pdf', { type: 'application/pdf' }));
  await expect(listReferences()).resolves.toEqual([
    expect.objectContaining({ name: 'dieta.pdf', mimeType: 'application/pdf' }),
  ]);
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- --run src/data/challengeRepository.test.ts`

Expected: FAIL because the repository does not exist.

- [ ] **Step 3: Implement a single-record IndexedDB repository**

Open database `tapago`, version `1`, with object stores `settings` and `references`; store the active challenge under key `activeChallenge`, and store each `ReferenceDocument` with its PDF `Blob`, filename, MIME type and creation timestamp in `references`. Validate parsed JSON is an object with `days` as an array of length 15 before returning it. Wrap native quota/read errors in `Error('Não foi possível salvar seus dados neste aparelho.')`; never call `clearChallenge` after a failed save or import.

- [ ] **Step 4: Add invalid JSON and clear tests, then run suite**

Add a test for malformed JSON returning `Backup inválido` and a test confirming `clearChallenge` makes `loadChallenge()` resolve `null`. Run: `npm run test -- --run src/data/challengeRepository.test.ts`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "feat: persist challenge and backups locally"
```

### Task 5: Create context and responsive application shell

**Files:**
- Create: `src/app/ChallengeContext.tsx`, `src/app/router.tsx`, `src/app/App.tsx`, `src/components/BottomNav.tsx`, `src/components/AppError.tsx`, `src/app/ChallengeContext.test.tsx`, `src/styles/tokens.css`, `src/styles/shell.css`
- Modify: `src/main.tsx`, `src/styles/global.css`

**Interfaces:**
- Consumes: domain and repository exports from Tasks 2 and 4.
- Produces `useChallenge()` with `{ challenge, loading, error, updateChallenge, resetChallenge, exportBackup, importBackup }` and routes `/`, `/diet`, `/workout`, `/progress`, `/setup`, `/references`.
- Consumed by: page components.

- [ ] **Step 1: Write failing context and navigation tests**

```tsx
it('shows an error without discarding the loaded challenge when saving fails', async () => {
  saveChallengeMock.mockRejectedValueOnce(new Error('Não foi possível salvar seus dados neste aparelho.'));
  render(<ChallengeProvider><TestConsumer /></ChallengeProvider>);
  await user.click(screen.getByRole('button', { name: 'Alterar desafio' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar seus dados neste aparelho.');
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- --run src/app/ChallengeContext.test.tsx`

Expected: FAIL because the provider is absent.

- [ ] **Step 3: Implement provider, routing and shell**

Load once on provider mount; expose immutable update actions that first update optimistic state and retain it on save error while displaying the error. Add a dark app shell with a fixed `<nav aria-label="Navegação principal">` containing links Hoje, Dieta, Treino, Progresso and Configurar. Keep touch targets at least 44px high.

- [ ] **Step 4: Run targeted tests and build**

Run: `npm run test -- --run src/app/ChallengeContext.test.tsx && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app src/components src/styles src/main.tsx
git commit -m "feat: add app state and mobile navigation"
```

### Task 6: Build setup, references, backup and reset flows

**Files:**
- Create: `src/pages/SetupPage.tsx`, `src/pages/ReferencesPage.tsx`, `src/pages/setupPage.test.tsx`, `src/components/ChallengeDayEditor.tsx`, `src/components/ExerciseEditor.tsx`, `src/components/ConfirmDialog.tsx`, `src/styles/setup.css`

**Interfaces:**
- Consumes: `useChallenge()`, `createPrefilledChallenge()`, `EXERCISE_IMAGES`, `Challenge` types.
- Produces: manual editor that creates a valid 15-day challenge, and reference/backup/reset controls.
- Consumed by: router only.

- [ ] **Step 1: Write failing setup flow tests**

```tsx
it('starts a fully configured fifteen-day challenge without a numeric walking target', async () => {
  renderSetup();
  await user.click(screen.getByRole('button', { name: 'Iniciar desafio' }));
  expect(await screen.findByRole('heading', { name: 'Dia 1 de 15' })).toBeVisible();
});

it('shows a clear message when importing an invalid backup file', async () => {
  renderSetup();
  await user.upload(screen.getByLabelText('Importar backup'), new File(['bad'], 'backup.json', { type: 'application/json' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Backup inválido');
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- --run src/pages/setupPage.test.tsx`

Expected: FAIL because setup pages do not exist.

- [ ] **Step 3: Implement explicit manual setup and management**

When the user starts a new challenge, call `createPrefilledChallenge(startDate)` and then render an editor for its 15 days with meals/items and ordered strength exercises. The seed repeats ABC continuously from the configured start date: Day 1 uses A, Day 2 B, Day 3 C, and so on, with no automatic rest days. Allow empty meals or strength workouts but label them as not configured. Every configured day includes simple `walkingComplete` and `boxingComplete` check-ins, with no numeric target or exercise details. Exercise editor selects `imageKey` only from `EXERCISE_IMAGES`. References accepts PDF files, checks MIME type `application/pdf`, then stores the successful file as a local PDF Blob through `saveReference` and lists saved document names for consultation. Provide JSON download export, file import through `parseChallengeBackup`, and a confirmation dialog before reset.

- [ ] **Step 4: Add successful import and reset confirmation tests**

Test that a valid 15-day JSON backup loads and that reset has no effect until the dialog confirmation button `Reiniciar desafio` is pressed. Run: `npm run test -- --run src/pages/setupPage.test.tsx`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages src/components src/styles/setup.css
git commit -m "feat: add challenge setup and local backup controls"
```

### Task 7: Implement the daily diet and workout check-ins

**Files:**
- Create: `src/pages/DietPage.tsx`, `src/pages/WorkoutPage.tsx`, `src/components/CheckinCard.tsx`, `src/components/ExerciseCard.tsx`, `src/pages/dailyPages.test.tsx`, `src/styles/daily.css`

**Interfaces:**
- Consumes: `useChallenge()`, `toggleMealItem()`, `toggleExercise()`, `getDayStatus()`, and `getExerciseImage()`.
- Produces: accessible diet and workout check-in pages for the current challenge day.
- Consumed by: router and Today page links.

- [ ] **Step 1: Write failing user-flow tests**

```tsx
it('marks a meal item and reflects diet completion', async () => {
  renderDietWithOneMealItem();
  await user.click(screen.getByRole('checkbox', { name: 'Aveia' }));
  expect(screen.getByText('Dieta concluída')).toBeVisible();
});

it('shows the local illustration and finishes the workout after its last exercise', async () => {
  renderWorkoutWithOneExercise('leg-press');
  expect(screen.getByRole('img', { name: 'Leg press' })).toHaveAttribute('src', expect.stringContaining('leg-press'));
  await user.click(screen.getByRole('checkbox', { name: 'Concluir Leg press' }));
  expect(screen.getByText('Treino concluído')).toBeVisible();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- --run src/pages/dailyPages.test.tsx`

Expected: FAIL because daily pages do not exist.

- [ ] **Step 3: Implement diet and workout pages**

Select the current calendar day by challenge start date; if outside the 15-day range, show a clear completed/not-started state rather than making arbitrary updates. Render every meal item and exercise as a labeled checkbox. Include exercise instructions and optional series/repetitions, local image with meaningful alt text, and a single status label derived from domain rules. On every check-in call the provider update action.

- [ ] **Step 4: Add out-of-range and reversal tests; run them**

Test that an out-of-range date displays the no-active-day message and that unchecking the final item removes the completed state. Run: `npm run test -- --run src/pages/dailyPages.test.tsx`.

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages src/components src/styles/daily.css
git commit -m "feat: add diet and workout daily checkins"
```

### Task 8: Implement Today and 15-day progress views

**Files:**
- Create: `src/pages/TodayPage.tsx`, `src/pages/ProgressPage.tsx`, `src/components/ProgressGrid.tsx`, `src/pages/progressPages.test.tsx`, `src/styles/progress.css`

**Interfaces:**
- Consumes: `useChallenge()`, `getDayStatus()`, `getChallengeProgress()`.
- Produces: current-day check-ins and 15-day progress visualization.
- Consumed by: router.

- [ ] **Step 1: Write failing progress tests**

```tsx
it('displays current-day diet, strength workout, walking and boxing actions', () => {
  renderTodayWithChallenge();
  expect(screen.getByRole('heading', { name: 'Dia 1 de 15' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Concluir caminhada' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Concluir boxe' })).toBeVisible();
});

it('renders every day in the progress grid with an accessible status label', () => {
  renderProgressWithChallenge();
  expect(screen.getAllByRole('listitem')).toHaveLength(15);
  expect(screen.getByLabelText('Dia 1: dieta pendente, musculação pendente, caminhada pendente, boxe pendente')).toBeVisible();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- --run src/pages/progressPages.test.tsx`

Expected: FAIL because pages and progress grid are absent.

- [ ] **Step 3: Implement the prioritized daily dashboard and grid**

Today shows `Dia N de 15`, direct diet/strength-workout links, and large walking and boxing toggles. ProgressGrid renders 15 list items with visible color/state indicators and full text aria-labels for the four outcomes. Use derived status only; do not store percentage or daily completion separately.

- [ ] **Step 4: Run test suite and build**

Run: `npm run test -- --run && npm run build`

Expected: all tests PASS and production build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/pages src/components src/styles/progress.css
git commit -m "feat: add daily dashboard and challenge progress"
```

### Task 9: Verify offline/mobile behavior and document deployment

**Files:**
- Create: `README.md`, `src/app/pwa.test.ts`
- Modify: `vite.config.ts`, `src/styles/global.css`

**Interfaces:**
- Consumes: built application and PWA configuration.
- Produces: deployment instructions and verified installable app configuration.

- [ ] **Step 1: Write failing PWA configuration test**

```ts
it('declares TaPago as a standalone PWA', () => {
  expect(pwaOptions.manifest).toMatchObject({ name: 'TaPago', short_name: 'TaPago', display: 'standalone' });
});
```

- [ ] **Step 2: Run test to verify failure**

Run: `npm run test -- --run src/app/pwa.test.ts`

Expected: FAIL until PWA options are exported for inspection.

- [ ] **Step 3: Finish deployment and mobile support**

Export PWA options from Vite config for the test and configure offline precaching for application assets. In `README.md`, document `npm install`, `npm run dev`, `npm run test`, `npm run build`, deployment on Vercel/Netlify, installation on a phone, local-data caveat, and backup recovery. Confirm global CSS reserves bottom space for navigation and respects safe-area insets.

- [ ] **Step 4: Run complete automated and manual verification**

Run: `npm run test -- --run && npm run build`.

Then run `npm run dev -- --host 127.0.0.1`, open the app at a 390px-wide viewport, and verify: ABC prefill, one diet check-in, one strength workout check-in with a bundled image, walking and boxing toggles, 15-day grid, error message from invalid JSON import, bottom navigation, and no horizontal scrolling. Stop the server afterward.

Expected: tests/build PASS; every manual behavior works at mobile width.

- [ ] **Step 5: Commit**

```bash
git add README.md vite.config.ts src/app/pwa.test.ts src/styles/global.css
git commit -m "docs: document tapago deployment and offline use"
```

## Self-Review

Coverage: Tasks 1 and 9 cover PWA/static deployment; Tasks 2, 7 and 8 cover all daily check-ins and progress; Task 3 covers the bundled image catalog; Tasks 4 and 6 cover IndexedDB, PDFs, backup, validation and reset; Task 5 covers mobile navigation and persistence errors. Out-of-scope items are not introduced.

The plan uses a single canonical set of type and function names from Task 2 onward. All tasks include executable tests and defined files, and no implementation placeholder remains.
