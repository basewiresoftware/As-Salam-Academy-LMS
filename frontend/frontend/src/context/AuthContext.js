import { createContext, useCallback, useContext, useMemo, useState } from 'react';

import api, { endpoints, setAuthToken } from '../../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Set the moment a family registers, cleared when they pay. Payment is a
  // mock with nothing behind it, so this only holds for the session that
  // signed up — a returning parent has no record to gate on.
  const [needsPayment, setNeedsPayment] = useState(false);

  // Both /login/ and /register/ answer with { access, refresh, username, role }.
  const adopt = useCallback(async (auth) => {
    setAuthToken(auth.access);
    const profile = await api.get(endpoints.currentUser);
    setUser(profile);
    return profile;
  }, []);

  // The backend matches on username AND role, so the caller must say which
  // door they are coming through.
  const login = useCallback(
    async (username, password, role) => {
      setIsLoading(true);
      try {
        const auth = await api.post(endpoints.login, { username, password, role });
        // Nothing records that a returning family has paid, so never gate them.
        setNeedsPayment(false);
        return await adopt(auth);
      } finally {
        setIsLoading(false);
      }
    },
    [adopt],
  );

  const register = useCallback(
    async (payload) => {
      setIsLoading(true);
      try {
        const auth = await api.post(endpoints.register, payload);
        // Raised before adopt() sets the user, not after. adopt() resolves in a
        // later microtask, so setting the flag afterwards lets React paint one
        // frame of the dashboard — and fire its fetch — before the gate lands.
        setNeedsPayment(true);
        return await adopt(auth);
      } finally {
        setIsLoading(false);
      }
    },
    [adopt],
  );

  const markPaid = useCallback(() => setNeedsPayment(false), []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setNeedsPayment(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      isLoading,
      needsPayment,
      login,
      register,
      markPaid,
      logout,
    }),
    [user, isLoading, needsPayment, login, register, markPaid, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}
