import type { ChallengeDay } from '../domain/challenge';
import { getExerciseImage } from '../assets/exercises/catalog';
import { ProgressBar } from '../components/ProgressBar';

export function WorkoutPage({ day, onToggleExercise }: { day: ChallengeDay; onToggleExercise: (id: string) => void }) {
  const complete = day.exercises.filter((exercise) => exercise.isComplete).length;
  const letter = ['A', 'B', 'C'][(day.dayNumber - 1) % 3];
  return <section className="workout-page"><header className="section-header"><span>TREINO {letter}</span><h2>Musculação ABC</h2><ProgressBar value={complete} total={day.exercises.length} label={`${complete} de ${day.exercises.length} exercícios concluídos`} /></header><div className="workout">{day.exercises.map((exercise) => <article className={`exercise ${exercise.isComplete ? 'is-complete' : ''}`} key={exercise.id}><strong className="exercise-title">{exercise.name}</strong><img src={getExerciseImage(exercise.imageKey)} alt={exercise.name}/><div className="exercise-footer"><div><p>{exercise.sets}</p>{exercise.note && <small>{exercise.note}</small>}</div><button aria-label={`Concluir ${exercise.name}`} onClick={() => onToggleExercise(exercise.id)}>{exercise.isComplete ? '✓' : '○'}</button></div></article>)}</div></section>;
}
