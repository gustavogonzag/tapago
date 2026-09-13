export function Toast({ message, error, onDismiss }: { message: string; error?: boolean; onDismiss?: () => void }) {
  return <aside className="toast" role={error ? 'alert' : 'status'}><span>{message}</span>{onDismiss && <button onClick={onDismiss}>Fechar</button>}</aside>;
}
