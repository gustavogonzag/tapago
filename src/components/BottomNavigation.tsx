import type { AppTab } from '../app/types';

const items: Array<{ tab: AppTab; label: string }> = [
  { tab: 'today', label: 'Hoje' },
  { tab: 'workout', label: 'Treino' },
  { tab: 'progress', label: 'Progresso' },
  { tab: 'settings', label: 'Ajustes' },
];

export function BottomNavigation({ activeTab, onSelect }: { activeTab: AppTab; onSelect: (tab: AppTab) => void }) {
  return <nav aria-label="Navegação principal">{items.map(({ tab, label }) => <button key={tab} aria-current={activeTab === tab ? 'page' : undefined} className={activeTab === tab ? 'is-active' : ''} onClick={() => onSelect(tab)}>{label}</button>)}</nav>;
}
