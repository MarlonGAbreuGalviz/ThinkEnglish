export default function EmptyState({ title, text, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">ED</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
      {actionLabel && onAction && (
        <button className="button secondary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
