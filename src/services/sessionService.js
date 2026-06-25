const SESSION_KEY = 'thinkenglish_manager_session';

export function getStoredSession() {
  const stored = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);

  if (!stored) {
    return null;
  }

  try {
    const session = JSON.parse(stored);
    if (session.expiresAt && new Date(session.expiresAt).getTime() > Date.now()) {
      return session;
    }
  } catch {
    clearStoredSession();
    return null;
  }

  clearStoredSession();
  return null;
}

export function persistSession(session) {
  clearStoredSession();
  const storage = session.rememberMe ? localStorage : sessionStorage;
  storage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function isTestSession() {
  return getStoredSession()?.token?.startsWith('test-session-') || false;
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
