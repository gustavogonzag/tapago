import { useEffect, useMemo, useState } from 'react';
import { createPrefilledChallenge, getChallengeProgress, getDayStatus, replaceChallengeDay, toggleDailyCheckin, toggleExercise, toggleMealItem, type Challenge } from '../domain/challenge';
import { loadChallenge, saveChallenge } from '../data/challengeRepository';
import { getExerciseImage } from '../assets/exercises/catalog';

type Tab = 'today' | 'workout' | 'progress' | 'settings';
const currentDay = (challenge: Challenge) => Math.min(14, Math.max(0, Math.floor((Date.now() - new Date(`${challenge.startDate}T00:00:00`).getTime()) / 86_400_000)));

export function App() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [tab, setTab] = useState<Tab>('today');
  const [loading, setLoading] = useState(true);
  useEffect(() => { loadChallenge().then(setChallenge).finally(() => setLoading(false)); }, []);
  const day = challenge?.days[currentDay(challenge)];
  const progress = useMemo(() => challenge && getChallengeProgress(challenge), [challenge]);
  const save = async (next: Challenge) => { setChallenge(next); await saveChallenge(next); };
  if (loading) return <main className="screen"><p>Carregando seu desafio…</p></main>;
  if (!challenge) return <main className="screen welcome"><span>15 DIAS</span><h1>TaPago</h1><p>Seu desafio fitness está pronto para começar.</p><button onClick={() => save(createPrefilledChallenge(new Date().toISOString().slice(0, 10)))}>Começar desafio ABC</button></main>;
  if (!day || !progress) return null;
  const status = getDayStatus(day);
  const updateDay = (next = day) => save(replaceChallengeDay(challenge, next));
  return <main className="screen"><header><span>DESAFIO ATIVO</span><h1>Dia {day.dayNumber} <small>de 15</small></h1><p>{progress.completed} check-ins concluídos</p></header>
    {tab === 'today' && <section className="stack"><div className="diet"><strong>Dieta</strong>{day.meals.map((meal) => <Check key={meal.id} label={meal.name} done={meal.items.every((item) => item.isComplete)} onClick={() => updateDay(toggleMealItem(day, meal.items[0].id))}/>)}</div><Check label="Musculação ABC" done={status.strengthComplete} onClick={() => setTab('workout')}/><Check label="Caminhada" done={status.walkingComplete} onClick={() => updateDay(toggleDailyCheckin(day, 'walking'))}/><Check label="Boxe" done={status.boxingComplete} onClick={() => updateDay(toggleDailyCheckin(day, 'boxing'))}/><Check label="Meta de água" done={status.waterComplete} onClick={() => updateDay(toggleDailyCheckin(day, 'water'))}/></section>}
    {tab === 'workout' && <section className="workout"><h2>Treino {['A','B','C'][(day.dayNumber - 1) % 3]}</h2>{day.exercises.map((exercise) => <article className="exercise" key={exercise.id}><img src={getExerciseImage(exercise.imageKey)} alt={exercise.name}/><div><strong>{exercise.name}</strong><p>{exercise.sets}</p>{exercise.note && <small>{exercise.note}</small>}</div><button aria-label={`Concluir ${exercise.name}`} onClick={() => updateDay(toggleExercise(day, exercise.id))}>{exercise.isComplete ? '✓' : '○'}</button></article>)}</section>}
    {tab === 'progress' && <section><h2>Progresso</h2><ol className="grid">{challenge.days.map((item) => { const count = Object.values(getDayStatus(item)).filter(Boolean).length; return <li key={item.id}><b>{item.dayNumber}</b><span>{count}/5</span></li>; })}</ol></section>}
    {tab === 'settings' && <section><h2>Seu desafio</h2><p>A rotina ABC está pré-carregada e se repete sem dias de descanso.</p><button onClick={() => { if (confirm('Reiniciar o desafio?')) save(createPrefilledChallenge(new Date().toISOString().slice(0, 10))); }}>Reiniciar desafio</button></section>}
    <nav aria-label="Navegação principal"><button onClick={() => setTab('today')}>Hoje</button><button onClick={() => setTab('workout')}>Treino</button><button onClick={() => setTab('progress')}>Progresso</button><button onClick={() => setTab('settings')}>Ajustes</button></nav></main>;
}
function Check({ label, done, onClick }: { label: string; done: boolean; onClick: () => void }) { return <button className="check" onClick={onClick}><span>{done ? '✓' : '○'}</span><strong>{label}</strong><small>{done ? 'Concluído' : 'Pendente'}</small></button>; }
