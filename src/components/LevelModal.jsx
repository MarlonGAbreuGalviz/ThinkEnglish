import { useState } from 'react';
import Modal from './Modal.jsx';

const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov'];

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getVideoError(file) {
  if (!file) return '';
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !ALLOWED_VIDEO_EXTENSIONS.includes(extension)) {
    return 'Selecciona un video MP4, WEBM o MOV.';
  }
  if (file.size > MAX_VIDEO_SIZE) return 'El video no puede superar 100 MB.';
  return '';
}

export default function LevelModal({ categoryId, level, onClose, onSave }) {
  const [name, setName] = useState(level?.name || '');
  const [exampleVideo, setExampleVideo] = useState(null);
  const [videoError, setVideoError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(level?.id);
  const trimmedName = name.trim();
  const nameError =
    !trimmedName
      ? 'El nombre es obligatorio.'
      : trimmedName.length < 2
        ? 'El nombre debe tener al menos 2 caracteres.'
        : trimmedName.length > 80
          ? 'El nombre no puede superar 80 caracteres.'
          : '';
  const requiredVideoError = !isEditing && !exampleVideo ? 'El video de ejemplo es obligatorio.' : '';

  const handleVideoChange = (event) => {
    const file = event.target.files?.[0] || null;
    const nextError = getVideoError(file);
    setExampleVideo(nextError ? null : file);
    setVideoError(nextError);
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSubmitError('');

    if (nameError || videoError || requiredVideoError || !categoryId) return;

    setIsSubmitting(true);
    try {
      await onSave({
        id: level?.id,
        categoryId,
        name: trimmedName,
        exampleVideo
      });
    } catch (requestError) {
      setSubmitError(requestError.message || 'No pudimos guardar el nivel ni subir el video.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Editar nivel' : 'Nuevo nivel'} onClose={onClose}>
      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label>
          Nombre del nivel
          <input
            className={submitted && nameError ? 'invalid' : ''}
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nivel 1 · Básico"
          />
          {submitted && nameError && <small className="field-error">{nameError}</small>}
        </label>

        {isEditing && level.exampleVideoUrl && (
          <div className="current-video">
            <span className="field-label">Video actual</span>
            <video controls preload="metadata" src={level.exampleVideoUrl}>
              Tu navegador no puede reproducir este video.
            </video>
            <a href={level.exampleVideoUrl} target="_blank" rel="noreferrer">
              Abrir video en otra pestaña
            </a>
          </div>
        )}

        <label>
          {isEditing ? 'Reemplazar video de ejemplo (opcional)' : 'Video de ejemplo'}
          <input
            className={(submitted && requiredVideoError) || videoError ? 'invalid' : ''}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={handleVideoChange}
          />
          <small className="helper-text">Formatos MP4, WEBM o MOV. Tamaño máximo: 100 MB.</small>
          {exampleVideo && (
            <span className="file-summary">
              <strong>{exampleVideo.name}</strong>
              <small>{formatFileSize(exampleVideo.size)}</small>
            </span>
          )}
          {videoError && <small className="field-error">{videoError}</small>}
          {submitted && requiredVideoError && <small className="field-error">{requiredVideoError}</small>}
        </label>

        {submitError && <p className="form-alert">{submitError}</p>}

        <div className="modal-actions">
          <button type="button" className="button ghost dark" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </button>
          <button className="button primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Subiendo video...' : 'Guardar nivel'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
