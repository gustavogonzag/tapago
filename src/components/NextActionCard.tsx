export function NextActionCard({ title, action, onClick }: { title: string; action: string; onClick: () => void }) {
  return <section className="next-action"><span>PRÓXIMA AÇÃO</span><h2>{title}</h2><button aria-label={action} onClick={onClick}>{action}</button></section>;
}
