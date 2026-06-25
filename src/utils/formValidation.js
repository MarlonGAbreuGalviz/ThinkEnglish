export const TEACHER_EMAIL_SUFFIX = '@profesor.duoc.cl';

export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const isTeacherEmail = (value) => {
  const email = value.trim().toLowerCase();
  return isValidEmail(email) && email.endsWith(TEACHER_EMAIL_SUFFIX);
};

export const isValidPersonName = (value) => /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]+$/.test(value.trim());

export function getPasswordRequirements(password, email) {
  return {
    length: password.length >= 8 && password.length <= 64,
    uppercase: /[A-ZÁÉÍÓÚÜÑ]/.test(password),
    lowercase: /[a-záéíóúüñ]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]/.test(password),
    noOuterSpaces: password === password.trim(),
    differsFromEmail: password.toLowerCase() !== email.trim().toLowerCase()
  };
}

export function getCategoryNameError(name, siblings = [], currentId = null) {
  const trimmedName = name.trim();
  if (!trimmedName) return 'El nombre es obligatorio.';
  if (trimmedName.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  if (trimmedName.length > 60) return 'El nombre no puede superar 60 caracteres.';

  const isDuplicate = siblings.some(
    (category) =>
      String(category.id) !== String(currentId) &&
      category.name?.trim().toLowerCase() === trimmedName.toLowerCase()
  );
  return isDuplicate ? 'Ya existe una categoría con ese nombre bajo el mismo padre.' : '';
}
