import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { BottomNavigation } from '../components/BottomNavigation';
import { TodayPage } from '../pages/TodayPage';
import { createPrefilledChallenge, getDayStatus } from '../domain/challenge';
import { WorkoutPage } from '../pages/WorkoutPage';

it('marks only the active navigation button as the current page', () => {
  render(<BottomNavigation activeTab="workout" onSelect={vi.fn()} />);

  expect(screen.getByRole('button', { name: 'Treino' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: 'Hoje' })).not.toHaveAttribute('aria-current');
});

it('shows workout completion count', () => {
  const day = createPrefilledChallenge('2026-09-13').days[0];
  render(<WorkoutPage day={day} onToggleExercise={vi.fn()} />);
  expect(screen.getByText('0 de 9 exercícios concluídos')).toBeVisible();
});

it('guides the first pending action before showing daily habits', () => {
  const day = createPrefilledChallenge('2026-09-13').days[0];
  render(<TodayPage day={day} status={getDayStatus(day)} onToggleMeal={vi.fn()} onToggleCheckin={vi.fn()} onOpenWorkout={vi.fn()} />);

  expect(screen.getByRole('button', { name: 'Marcar Café' })).toBeVisible();
});
