import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRouter } from '../routes/RouterContext.jsx';
import { getPasswordRequirements, isTeacherEmail, isValidPersonName } from '../utils/formValidation.js';

function getNameError(value, label) {
  const name = value.trim();
  if (!name) return `${label} es obligatorio.`;
  if (name.length < 2) return `${label} debe tener al menos 2 caracteres.`;
  if (name.length > 40) return `${label} no puede superar 40 caracteres.`;
  if (!isValidPersonName(name)) return `${label} solo puede contener letras, espacios y acentos.`;
  return '';
}

export default function RegisterPage() {
  const { register } = useAuth();
  const { navigate } = useRouter();
  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordRequirements = useMemo(
    () => getPasswordRequirements(form.password, form.email),
    [form.password, form.email]
  );

  const errors = {
    name: getNameError(form.name, 'El nombre'),
    lastName: getNameError(form.lastName, 'El apellido'),
    email: isTeacherEmail(form.email) ? '' : 'Usa tu correo terminado en @profesor.duoc.cl.',
    password: Object.values(passwordRequirements).every(Boolean) ? '' : 'La contraseña aún no cumple todos los requisitos.',
    confirmPassword:
      !form.confirmPassword || form.confirmPassword !== form.password
        ? 'Las contraseñas deben coincidir.'
        : ''
  };

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    setSuccess(false);
    setError('');

    if (Object.values(errors).some(Boolean)) return;

    setIsSubmitting(true);
    try {
      await register({
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password
      });
      setSuccess(true);
      setForm({ name: '', lastName: '', email: '', password: '', confirmPassword: '' });
      setSubmitted(false);
    } catch (requestError) {
      setError(requestError.message || 'No pudimos crear la cuenta con los datos ingresados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requirementLabels = {
    length: 'Entre 8 y 64 caracteres',
    uppercase: 'Al menos una mayúscula',
    lowercase: 'Al menos una minúscula',
    number: 'Al menos un número',
    symbol: 'Al menos un símbolo',
    noOuterSpaces: 'Sin espacios al inicio o al final',
    differsFromEmail: 'Distinta del correo electrónico'
  };

  return (
    <main className="login-page">
      <section className="recovery-panel">
        <form className="login-card" onSubmit={handleSubmit} noValidate>
          <div>
            <span className="mini-label">Registro de docentes</span>
            <h2>Crear cuenta</h2>
            <p className="helper-text">La cuenta quedará pendiente hasta que un administrador la active.</p>
          </div>

          <div className="form-row register-name-row">
            <label>
              Nombre
              <input
                className={submitted && errors.name ? 'invalid' : ''}
                value={form.name}
                maxLength={40}
                onChange={(event) => updateField('name', event.target.value)}
                autoComplete="given-name"
              />
              {submitted && errors.name && <small className="field-error">{errors.name}</small>}
            </label>
            <label>
              Apellido
              <input
                className={submitted && errors.lastName ? 'invalid' : ''}
                value={form.lastName}
                maxLength={40}
                onChange={(event) => updateField('lastName', event.target.value)}
                autoComplete="family-name"
              />
              {submitted && errors.lastName && <small className="field-error">{errors.lastName}</small>}
            </label>
          </div>

          <label>
            Email docente
            <input
              className={submitted && errors.email ? 'invalid' : ''}
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="nombre@profesor.duoc.cl"
              autoComplete="email"
            />
            {submitted && errors.email && <small className="field-error">{errors.email}</small>}
          </label>

          <label>
            Contraseña
            <input
              className={submitted && errors.password ? 'invalid' : ''}
              type="password"
              value={form.password}
              maxLength={64}
              onChange={(event) => updateField('password', event.target.value)}
              autoComplete="new-password"
            />
          </label>

          <ul className="password-requirements" aria-label="Requisitos de contraseña">
            {Object.entries(requirementLabels).map(([key, label]) => (
              <li key={key} className={passwordRequirements[key] ? 'is-valid' : ''}>
                {label}
              </li>
            ))}
          </ul>

          <label>
            Confirmar contraseña
            <input
              className={submitted && errors.confirmPassword ? 'invalid' : ''}
              type="password"
              value={form.confirmPassword}
              maxLength={64}
              onChange={(event) => updateField('confirmPassword', event.target.value)}
              autoComplete="new-password"
            />
            {submitted && errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
          </label>

          {error && <p className="form-alert">{error}</p>}
          {success && (
            <p className="success-alert">Tu cuenta fue registrada, pero aún está pendiente de activación.</p>
          )}

          <button className="button primary full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta docente'}
          </button>
          <button type="button" className="button ghost dark full" onClick={() => navigate('/login')}>
            Volver al inicio de sesión
          </button>
        </form>
      </section>
    </main>
  );
}
