# TaPago UX Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn TaPago into a focused mobile-first challenge companion with a clear next action, trustworthy feedback, and consistent responsive screens.

**Architecture:** Keep challenge rules in `src/domain` and IndexedDB in `src/data`; replace the monolithic application component with page components that receive the active day and immutable update callbacks. Reusable cards render all visual states, while `App` owns loading, persistence, toast/error feedback, and tab selection.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, IndexedDB via idb, plain CSS, vite-plugin-pwa.

**Spec:** `docs/superpowers/specs/2026-09-13-tapago-ux-refinement-design.md`

## Global Constraints

- Preserve the 15-day ABC challenge, five daily areas, bundled exercise images, and IndexedDB persistence.
- Mobile is the reference layout; all primary buttons must be at least 44px high and the bottom navigation must respect safe areas.
- No points, rankings, medals, servers, authentication, videos, PDF flows, or external images.
- Use existing graphite/teal visual language, CSS tokens, sufficient contrast, `aria-current="page"`, and `prefers-reduced-motion`.
- On save failure, retain visible state and show `Não foi possível salvar seus dados neste aparelho.` with retry.

---

## File Structure

- `src/app/App.tsx`: shell, loading/error/toast, persistence and tab routing.
- `src/app/types.ts`: `AppTab`, `ChallengeActions`, and shared page props.
- `src/pages/TodayPage.tsx`: daily progress, next action, five-area list and completed-day state.
- `src/pages/WorkoutPage.tsx`: ABC summary and vertical exercise cards.
- `src/pages/ProgressPage.tsx`: 15-day grid and legend.
- `src/pages/SettingsPage.tsx`: challenge start/restart.
- `src/components/DailyHabitCard.tsx`, `NextActionCard.tsx`, `WorkoutExerciseCard.tsx`, `ProgressBar.tsx`, `ProgressGrid.tsx`, `BottomNavigation.tsx`, `Toast.tsx`: focused reusable UI.
- `src/styles/tokens.css`, `src/styles/app.css`: visual tokens and responsive component styles.
- `src/app/appFlows.test.tsx`: page-flow, persistence-error and navigation accessibility tests.

### Task 1: Extract shared UI primitives and navigation

**Files:**
- Create: `src/app/types.ts`, `src/components/ProgressBar.tsx`, `src/components/BottomNavigation.tsx`, `src/components/Toast.tsx`, `src/styles/tokens.css`
- Modify: `src/main.tsx`, `src/styles/global.css`
- Test: `src/app/appFlows.test.tsx`

**Interfaces:**
- Produces `AppTab = 'today' | 'workout' | 'progress' | 'settings'`, `BottomNavigation({ activeTab, onSelect })`, `ProgressBar({ value, total, label })`, and `Toast({ message, tone, onDismiss })`.

- [ ] **Step 1: Write the failing accessibility tests**

```tsx
it('marks only the active navigation button as the current page', () => {
  render(<BottomNavigation activeTab="workout" onSelect={vi.fn()} />);
  expect(screen.getByRole('button', { name: 'Treino' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: 'Hoje' })).not.toHaveAttribute('aria-current');
});
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npm run test -- --run src/app/appFlows.test.tsx`

Expected: FAIL because `BottomNavigation` does not exist.

- [ ] **Step 3: Implement primitives and tokens**

Export CSS custom properties for page, surface, surface-active, text, muted, accent, danger, radius and shadow. `BottomNavigation` renders Hoje, Treino, Progresso and Ajustes using buttons with `aria-current="page"` only for `activeTab`. `ProgressBar` exposes `role="progressbar"`, `aria-valuenow`, `aria-valuemin` and `aria-valuemax`; `Toast` uses `role="status"` for confirmation and `role="alert"` for failure.

- [ ] **Step 4: Run targeted tests and build**

Run: `npm run test -- --run src/app/appFlows.test.tsx && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/types.ts src/components src/styles src/app/appFlows.test.tsx src/main.tsx
git commit -m "feat: add shared TaPago interface primitives"
```

### Task 2: Build the guided Today experience

**Files:**
- Create: `src/pages/TodayPage.tsx`, `src/components/DailyHabitCard.tsx`, `src/components/NextActionCard.tsx`
- Modify: `src/app/App.tsx`, `src/app/appFlows.test.tsx`

**Interfaces:**
- Consumes: `ChallengeDay`, `DayStatus`, `toggleMealItem`, `toggleDailyCheckin`, `getDayStatus`.
- Produces `TodayPage({ day, status, onToggleMeal, onToggleCheckin, onOpenWorkout })`.

- [ ] **Step 1: Write failing next-action and completion tests**

```tsx
it('guides the first pending action before showing the habit list', () => {
  renderToday({ breakfastComplete: false });
  expect(screen.getByRole('button', { name: 'Marcar Café' })).toBeVisible();
});

it('shows the completed-day state after five daily areas are complete', () => {
  renderToday({ allAreasComplete: true });
  expect(screen.getByText('Dia concluído')).toBeVisible();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- --run src/app/appFlows.test.tsx`

Expected: FAIL because `TodayPage` does not exist.

- [ ] **Step 3: Implement priority and daily habit cards**

Implement deterministic priority: Café, Almoço, Janta, Musculação ABC, Caminhada, Boxe, Meta de água. The diet habit card shows `N de 3 refeições`; the remaining four areas show Pendente or Concluído. `NextActionCard` calls the matching callback. When all five areas are complete, replace it with the `Dia concluído` confirmation and no extra action. Every card remains visible and keyboard reachable.

- [ ] **Step 4: Run targeted tests**

Run: `npm run test -- --run src/app/appFlows.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages/TodayPage.tsx src/components/DailyHabitCard.tsx src/components/NextActionCard.tsx src/app/App.tsx src/app/appFlows.test.tsx
git commit -m "feat: guide daily TaPago checkins"
```

### Task 3: Refine workout and progress pages

**Files:**
- Create: `src/pages/WorkoutPage.tsx`, `src/pages/ProgressPage.tsx`, `src/components/WorkoutExerciseCard.tsx`, `src/components/ProgressGrid.tsx`
- Modify: `src/app/App.tsx`, `src/app/appFlows.test.tsx`

**Interfaces:**
- Consumes: `WorkoutExercise`, `Challenge`, `getExerciseImage`, `getDayStatus` and `getChallengeProgress`.
- Produces `WorkoutPage({ day, onToggleExercise })` and `ProgressPage({ challenge, currentDayNumber })`.

- [ ] **Step 1: Write failing workout and progress tests**

```tsx
it('announces workout completion count and renders a vertical exercise card', () => {
  renderWorkout({ completedExercises: 2, totalExercises: 9 });
  expect(screen.getByText('2 de 9 exercícios concluídos')).toBeVisible();
  expect(screen.getByRole('img', { name: 'Supino inclinado com barra' })).toBeVisible();
});

it('labels current day and explains progress grid values', () => {
  renderProgress({ currentDayNumber: 2 });
  expect(screen.getByLabelText('Dia atual: 2 de 15')).toBeVisible();
  expect(screen.getByText('Cada dia mostra áreas concluídas de 5.')).toBeVisible();
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- --run src/app/appFlows.test.tsx`

Expected: FAIL because refined page components do not exist.

- [ ] **Step 3: Implement page-specific hierarchy**

WorkoutPage derives ABC label and group label from day number, renders `N de M exercícios concluídos` through `ProgressBar`, then one `WorkoutExerciseCard` per exercise in title → image → prescription/check order. ProgressPage renders `ProgressGrid` with 15 labeled items, visual current-day class, compact `N/5`, and the exact legend text from the test.

- [ ] **Step 4: Run targeted tests and build**

Run: `npm run test -- --run src/app/appFlows.test.tsx && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/pages src/components/WorkoutExerciseCard.tsx src/components/ProgressGrid.tsx src/app/App.tsx src/app/appFlows.test.tsx
git commit -m "feat: refine workout and progress screens"
```

### Task 4: Integrate persistence feedback and responsive visual system

**Files:**
- Create: `src/pages/SettingsPage.tsx`, `src/styles/app.css`
- Modify: `src/app/App.tsx`, `src/styles/global.css`, `src/app/appFlows.test.tsx`

**Interfaces:**
- Consumes: `saveChallenge`, `createPrefilledChallenge`, `Toast` and all page component props.
- Produces a complete responsive app shell with `retrySave(): Promise<void>`.

- [ ] **Step 1: Write failing save-error test**

```tsx
it('keeps the optimistic check-in visible and offers retry when persistence fails', async () => {
  saveChallengeMock.mockRejectedValueOnce(new Error('disk full'));
  renderAppWithChallenge();
  await user.click(screen.getByRole('button', { name: 'Concluir caminhada' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível salvar seus dados neste aparelho.');
  expect(screen.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npm run test -- --run src/app/appFlows.test.tsx`

Expected: FAIL because App does not retain a failed optimistic update or expose retry.

- [ ] **Step 3: Implement shell, feedback and responsive styles**

Store the latest optimistic challenge as `pendingChallenge`; on save failure leave it rendered, show the exact error alert and make retry save that same value. On success show a short `Check-in salvo` status toast. SettingsPage retains explicit reset confirmation. Define mobile styles first; at 900px use a two-column content grid and top navigation. Add `@media (prefers-reduced-motion: reduce)` to disable transitions and animations.

- [ ] **Step 4: Run full verification**

Run: `npm run test -- --run && npm run build`

Expected: all tests PASS and PWA build succeeds.

- [ ] **Step 5: Perform required visual checks**

Run the Vite server and inspect 390px, 768px and 1440px widths. Confirm no horizontal overflow; check Today, Workout, Progress, completed-day, empty challenge and save-error states. Record any discovered defect as a test before fixing it.

- [ ] **Step 6: Commit**

```bash
git add src/app src/pages src/components src/styles
git commit -m "feat: complete responsive TaPago experience"
```

## Self-Review

Coverage: Task 1 adds shared accessible primitives; Task 2 implements the prioritized daily flow and completed-day state; Task 3 covers training and 15-day progress; Task 4 covers persistence feedback, reset, responsiveness and reduced motion. The plan preserves all stated constraints and uses matching component/type names across tasks.
