import {
  createEmptyChallenge,
  getChallengeProgress,
  getDayStatus,
  toggleDailyCheckin,
  toggleExercise,
  toggleMealItem,
  type ChallengeDay,
} from './challenge';

function dayWithExercises(completed: boolean[]): ChallengeDay {
  return {
    id: 'day-1',
    dayNumber: 1,
    dietManuallyComplete: false,
    walkingComplete: false,
    boxingComplete: false,
    waterComplete: false,
    meals: [],
    exercises: completed.map((isComplete, index) => ({
      id: `exercise-${index + 1}`,
      name: `Exercise ${index + 1}`,
      imageKey: 'placeholder',
      isComplete,
    })),
  };
}

describe('challenge rules', () => {
  it('marks strength workout complete only when every exercise is complete', () => {
    const day = dayWithExercises([false, false]);

    expect(getDayStatus(day).strengthComplete).toBe(false);
    expect(getDayStatus(toggleExercise(day, 'exercise-1')).strengthComplete).toBe(false);
    expect(
      getDayStatus(toggleExercise(toggleExercise(day, 'exercise-1'), 'exercise-2')).strengthComplete,
    ).toBe(true);
  });

  it('creates exactly fifteen challenge days and calculates sixty daily check-ins', () => {
    const challenge = createEmptyChallenge('2026-09-13');

    expect(challenge.days).toHaveLength(15);
    expect(challenge.days[0].meals.map((meal) => meal.name)).toEqual(['Café', 'Almoço', 'Janta']);
    expect(getChallengeProgress(challenge)).toEqual({ completed: 0, total: 75 });
  });

  it('recalculates diet completion when a completed meal item is unchecked', () => {
    const day: ChallengeDay = {
      ...dayWithExercises([]),
      meals: [{ id: 'meal-1', name: 'Café', items: [{ id: 'oats', label: 'Aveia', isComplete: true }] }],
    };

    expect(getDayStatus(day).dietComplete).toBe(true);
    expect(getDayStatus(toggleMealItem(day, 'oats')).dietComplete).toBe(false);
  });

  it('toggles walking and boxing without changing the original day', () => {
    const day = dayWithExercises([]);
    const walked = toggleDailyCheckin(day, 'walking');
    const boxed = toggleDailyCheckin(walked, 'boxing');

    expect(day.walkingComplete).toBe(false);
    expect(getDayStatus(boxed)).toMatchObject({ walkingComplete: true, boxingComplete: true });
  });

  it('tracks water as an independent daily check-in', () => {
    const hydrated = toggleDailyCheckin(dayWithExercises([]), 'water');

    expect(getDayStatus(hydrated).waterComplete).toBe(true);
  });
});
