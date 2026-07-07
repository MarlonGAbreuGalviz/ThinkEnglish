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
    <main className="login-page auth-page-polished">
      <section className="login-panel">
        <div className="login-brand auth-brand-panel">
          <span className="brand-mark">TM</span>
          <div>
            <p className="eyebrow">Recuperación de acceso</p>
            <h1>Volvamos a conectar</h1>
            <p>Ingresa tu correo docente institucional y recibirás instrucciones para recuperar el acceso al panel.</p>
          </div>
        </div>

        <div className="login-card auth-form-card recovery-card">
          <div className="auth-card-header">
            <span className="mini-label">Recuperación de acceso</span>
            <h2>Recuperar cuenta</h2>
            <p className="helper-text">Usa el correo asociado a tu cuenta docente.</p>
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

            {success && <p className="success-alert">Si el correo está registrado, recibirás instrucciones para recuperar tu cuenta.</p>}
            {error && <p className="form-alert">{error}</p>}

            <div className="modal-actions auth-actions-row">
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