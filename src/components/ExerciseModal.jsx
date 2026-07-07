import { useMemo, useState } from 'react';
import Modal from './Modal.jsx';

const MAX_TITLE_LENGTH = 80;
const MAX_STATEMENT_LENGTH = 5000;
const scorePattern = /^(100|[1-9][0-9]?)$/;

export default function ExerciseModal({ levels, exercise, selectedLevelId, onClose, onSave }) {
  const [form, setForm] = useState({
    title: exercise?.title || '',
    levelId: exercise?.levelId || selectedLevelId || levels[0]?.id || '',
    score: String(exercise?.score || 10),
    statement: exercise?.statement || ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const errors = useMemo(() => {
    const title = form.title.trim();
    const statement = form.statement.trim();

    return {
      title:
        !title
          ? 'El título es obligatorio.'
          : title.length < 3
            ? 'El título debe tener al menos 3 caracteres.'
            : title.length > MAX_TITLE_LENGTH
              ? `El título no puede superar ${MAX_TITLE_LENGTH} caracteres.`
              : '',
      levelId: form.levelId ? '' : 'Selecciona un nivel.',
      score: scorePattern.test(form.score) ? '' : 'Ingresa un número entero entre 1 y 100.',
      statement:
        !statement
          ? 'El enunciado es obligatorio.'
          : form.statement.length > MAX_STATEMENT_LENGTH
            ? `El enunciado no puede superar ${MAX_STATEMENT_LENGTH} caracteres.`
            : ''
    };
  }, [form]);

  const hasErrors = Object.values(errors).some(Boolean);

  const updateField = (field, value) => {
    if (field === 'score' && !/^\d{0,3}$/.test(value)) return;
    if (field === 'title' && value.length > MAX_TITLE_LENGTH) return;

    setForm((current) => ({ ...current, [field]: value }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError('');

    if (hasErrors) return;

    setIsSubmitting(true);

    try {
      await onSave({
        id: exercise?.id,
        levelId: form.levelId,
        title: form.title.trim(),
        score: Number(form.score),
        statement: form.statement.trim()
      });
    } catch (requestError) {
      setSubmitError(requestError.message || 'No pudimos guardar el ejercicio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleCounterClass = form.title.length >= MAX_TITLE_LENGTH ? 'counter is-warning' : 'counter';

  return (
    <Modal title={exercise ? 'Editar ejercicio' : 'Nuevo ejercicio'} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label>
          Título
          <input
            className={submitted && errors.title ? 'invalid' : ''}
            value={form.title}
            maxLength={MAX_TITLE_LENGTH}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Ej: Present simple"
          />
          <span className={titleCounterClass}>
            {form.title.length} / {MAX_TITLE_LENGTH}
          </span>
          {submitted && errors.title && <small className="field-error">{errors.title}</small>}
        </label>

        <div className="form-row">
          <label>
            Nivel
            <select
              className={submitted && errors.levelId ? 'invalid' : ''}
              value={form.levelId}
              onChange={(event) => updateField('levelId', event.target.value)}
            >
              {levels.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
            {submitted && errors.levelId && <small className="field-error">{errors.levelId}</small>}
          </label>

          <label>
            Puntaje
            <input
              className={submitted && errors.score ? 'invalid' : ''}
              inputMode="numeric"
              value={form.score}
              onChange={(event) => updateField('score', event.target.value)}
              placeholder="1 a 100"
            />
            {submitted && errors.score && <small className="field-error">{errors.score}</small>}
          </label>
        </div>

        <label>
          Enunciado
          <textarea
            className={submitted && errors.statement ? 'invalid' : ''}
            maxLength={MAX_STATEMENT_LENGTH}
            value={form.statement}
            onChange={(event) => updateField('statement', event.target.value)}
            placeholder="Describe la actividad que verá el estudiante..."
          />
          <span className="counter">
            {form.statement.length} / {MAX_STATEMENT_LENGTH}
          </span>
          {submitted && errors.statement && <small className="field-error">{errors.statement}</small>}
        </label>

        {submitError && <p className="form-alert">{submitError}</p>}

        <div className="modal-actions">
          <button type="button" className="button ghost dark" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}