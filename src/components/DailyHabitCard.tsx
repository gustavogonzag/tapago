export function DailyHabitCard({ label, detail, done, onClick }: { label: string; detail: string; done: boolean; onClick: () => void }) {
  return <button className={`habit-card ${done ? 'is-complete' : ''}`} onClick={onClick}><span>{done ? '✓' : '○'}</span><strong>{label}</strong><small>{detail}</small></button>;
}
