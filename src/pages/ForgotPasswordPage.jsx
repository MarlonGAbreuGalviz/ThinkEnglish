import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRouter } from '../routes/RouterContext.jsx';
import { isTeacherEmail } from '../utils/formValidation.js';

export default function ForgotPasswordPage() {
  const { navigate } = useRouter();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasEmailError = !isTeacherEmail(email);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSuccess(false);
    setError('');

    if (hasEmailError) return;

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.message || 'No pudimos enviar las instrucciones.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="recovery-panel">
        <div className="login-card">
          <div>
            <span className="mini-label">Recuperación de acceso</span>
            <h2>Recuperar cuenta</h2>
            <p className="helper-text">Ingresa tu correo docente institucional para recibir instrucciones.</p>
          </div>

          <form className="form-grid" onSubmit={handleSubmit} noValidate>
            <label>
              Email docente
              <input
                className={submitted && hasEmailError ? 'invalid' : ''}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre@profesor.duoc.cl"
                autoComplete="email"
              />
              {submitted && hasEmailError && (
                <small className="field-error">Usa un correo válido terminado en @profesor.duoc.cl.</small>
              )}
            </label>

            {success && (
              <p className="success-alert">
                Si el correo está registrado, recibirás instrucciones para recuperar tu cuenta.
              </p>
            )}
            {error && <p className="form-alert">{error}</p>}

            <div className="modal-actions">
              <button type="button" className="button ghost dark" onClick={() => navigate('/login')}>
                Volver al inicio de sesión
              </button>
              <button className="button primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar instrucciones'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
