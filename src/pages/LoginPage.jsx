import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRouter } from '../routes/RouterContext.jsx';
import { isValidEmail } from '../utils/formValidation.js';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { navigate } = useRouter();
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    navigate('/', { replace: true });
    return null;
  }

  const errors = {
    email: !isValidEmail(form.email),
    password: !form.password.trim()
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setError('');

    if (Object.values(errors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await login(form.email, form.password, form.rememberMe);
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'No pudimos iniciar sesión con esas credenciales.');
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
            <p className="eyebrow">Duoc UC · English AI</p>
            <h1>ThinkEnglish Manager</h1>
            <p>Administra categorías, niveles, videos y ejercicios para una experiencia de aprendizaje guiada por IA.</p>
          </div>
        </div>

        <form className="login-card auth-form-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-card-header">
            <span className="mini-label">Acceso privado</span>
            <h2>Iniciar sesión</h2>
            <p className="helper-text">Ingresa con tus credenciales institucionales para continuar.</p>
          </div>

          <label>
            Email
            <input
              className={submitted && errors.email ? 'invalid' : ''}
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="correo@duoc.cl"
              autoComplete="email"
            />
            {submitted && errors.email && <small className="field-error">Ingresa un correo válido.</small>}
          </label>

          <label>
            Contraseña
            <input
              className={submitted && errors.password ? 'invalid' : ''}
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Ingresa tu contraseña"
              autoComplete="current-password"
            />
            {submitted && errors.password && <small className="field-error">La contraseña es obligatoria.</small>}
          </label>

          <div className="login-options">
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.rememberMe}
                onChange={(event) => updateField('rememberMe', event.target.checked)}
              />
              Recordarme
            </label>

            <button type="button" className="text-button" onClick={() => navigate('/forgot-password')}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {error && <p className="form-alert">{error}</p>}

          <button className="button primary full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Entrar al panel'}
          </button>

          <p className="auth-switch">
            ¿Eres docente y aún no tienes cuenta?{' '}
            <button type="button" className="text-button" onClick={() => navigate('/register')}>
              Crear cuenta
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}