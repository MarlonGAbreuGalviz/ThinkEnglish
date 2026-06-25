import { createContext, useContext, useMemo, useState } from 'react';
import * as authApiService from '../services/authApiService.js';
import { clearStoredSession, getStoredSession, persistSession } from '../services/sessionService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);
  const user = session?.user || null;

  const value = useMemo(
    () => ({
      session,
      user,
      isAuthenticated: Boolean(user),
      async login(email, password, rememberMe) {
        const response = await authApiService.login({ email: email.trim(), password });
        const status = response.user?.status;

        if (status === 'PENDING') {
          throw new Error('Tu cuenta fue registrada, pero aún está pendiente de activación.');
        }
        if (status === 'DISABLED') {
          throw new Error('Tu cuenta se encuentra deshabilitada. Contacta al administrador.');
        }
        if (status && status !== 'ACTIVE') {
          throw new Error('El estado de tu cuenta no permite iniciar sesión.');
        }

        const expiresInSeconds = Number(response.expiresIn);
        const nextSession = {
          ...response,
          rememberMe,
          expiresAt:
            response.expiresAt ||
            new Date(Date.now() + (Number.isFinite(expiresInSeconds) ? expiresInSeconds * 1000 : 8 * 60 * 60 * 1000)).toISOString()
        };
        persistSession(nextSession);
        setSession(nextSession);
        return nextSession;
      },
      register(data) {
        return authApiService.registerUser(data);
      },
      async requestPasswordReset(email) {
        return authApiService.requestPasswordReset(email);
      },
      async logout() {
        try {
          await authApiService.logout();
        } catch {
          // Closing the local session must not depend on backend availability.
        } finally {
          clearStoredSession();
          setSession(null);
        }
      },
      canDeleteCategories: user?.role === 'ADMIN',
      canManageStructure: user?.role === 'ADMIN',
      canManageLevels: user?.role === 'ADMIN',
      canManageExercises: user?.role === 'ADMIN' || user?.role === 'DOCENTE',
      canDeleteExercises: user?.role === 'ADMIN'
    }),
    [session, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
