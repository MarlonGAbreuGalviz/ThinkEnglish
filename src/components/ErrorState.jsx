export default function ErrorState({ title = 'No pudimos cargar la información', message, onRetry }) {
  return (
    <div className="state-box error-state">
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {onRetry && (
        <button className="button secondary" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
