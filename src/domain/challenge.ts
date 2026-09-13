export type MealItem = {
  id: string;
  label: string;
  isComplete: boolean;
};

export type Meal = {
  id: string;
  name: string;
  items: MealItem[];
};

export type WorkoutExercise = {
  id: string;
  name: string;
  imageKey: string;
  sets?: string;
  note?: string;
  isComplete: boolean;
};

export type ChallengeDay = {
  id: string;
  dayNumber: number;
  dietManuallyComplete: boolean;
  walkingComplete: boolean;
  boxingComplete: boolean;
  waterComplete: boolean;
  meals: Meal[];
  exercises: WorkoutExercise[];
};

export type Challenge = {
  id: string;
  startDate: string;
  days: ChallengeDay[];
};

export type DayStatus = {
  dietComplete: boolean;
  strengthComplete: boolean;
  walkingComplete: boolean;
  boxingComplete: boolean;
  waterComplete: boolean;
};

export function createEmptyChallenge(startDate: string): Challenge {
  return {
    id: crypto.randomUUID(),
    startDate,
    days: Array.from({ length: 15 }, (_, index) => ({
      id: crypto.randomUUID(),
      dayNumber: index + 1,
      dietManuallyComplete: false,
      walkingComplete: false,
      boxingComplete: false,
      waterComplete: false,
      meals: ['Café', 'Almoço', 'Janta'].map((name) => ({ id: crypto.randomUUID(), name, items: [{ id: crypto.randomUUID(), label: name, isComplete: false }] })),
      exercises: [],
    })),
  };
}

export function createPrefilledChallenge(startDate: string): Challenge {
  const challenge = createEmptyChallenge(startDate);
  return {
    ...challenge,
    days: challenge.days.map((day) => ({
      ...day,
      exercises: getTemplateForChallengeDay(day.dayNumber).map((template) => ({
        ...template,
        id: crypto.randomUUID(),
        isComplete: false,
      })),
    })),
  };
}

export function replaceChallengeDay(challenge: Challenge, updatedDay: ChallengeDay): Challenge {
  return { ...challenge, days: challenge.days.map((day) => day.id === updatedDay.id ? updatedDay : day) };
}

export function toggleExercise(day: ChallengeDay, exerciseId: string): ChallengeDay {
  return {
    ...day,
    exercises: day.exercises.map((exercise) =>
      exercise.id === exerciseId ? { ...exercise, isComplete: !exercise.isComplete } : exercise,
    ),
  };
}

export function toggleMealItem(day: ChallengeDay, itemId: string): ChallengeDay {
  return {
    ...day,
    meals: day.meals.map((meal) => ({
      ...meal,
      items: meal.items.map((item) =>
        item.id === itemId ? { ...item, isComplete: !item.isComplete } : item,
      ),
    })),
  };
}

export function toggleDailyCheckin(day: ChallengeDay, checkin: 'walking' | 'boxing' | 'water'): ChallengeDay {
  if (checkin === 'walking') return { ...day, walkingComplete: !day.walkingComplete };
  if (checkin === 'boxing') return { ...day, boxingComplete: !day.boxingComplete };
  return { ...day, waterComplete: !day.waterComplete };
}

export function getDayStatus(day: ChallengeDay): DayStatus {
  const mealItems = day.meals.flatMap((meal) => meal.items);

  return {
    dietComplete: day.dietManuallyComplete || (mealItems.length > 0 && mealItems.every((item) => item.isComplete)),
    strengthComplete: day.exercises.length > 0 && day.exercises.every((exercise) => exercise.isComplete),
    walkingComplete: day.walkingComplete,
    boxingComplete: day.boxingComplete,
    waterComplete: day.waterComplete,
  };
}

export function getChallengeProgress(challenge: Challenge): { completed: number; total: number } {
  const completed = challenge.days.reduce((total, day) => {
    const status = getDayStatus(day);
    return total + Number(status.dietComplete) + Number(status.strengthComplete) + Number(status.walkingComplete) + Number(status.boxingComplete) + Number(status.waterComplete);
  }, 0);

  return { completed, total: 75 };
}
import { getTemplateForChallengeDay } from './abcTemplates';
