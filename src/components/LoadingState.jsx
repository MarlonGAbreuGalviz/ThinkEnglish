export default function LoadingState({ text = 'Cargando información...' }) {
  return (
    <div className="state-box">
      <strong>{text}</strong>
      <p>Estamos consultando la información disponible.</p>
    </div>
  );
}
