import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { api, tokenStorage } from '../api/client';
import type { AuthUser, LoginResponse } from '../api/types';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null);

  useEffect(() => {
    if (!tokenStorage.get()) return;
    api
      .get<AuthUser>('/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
    tokenStorage.set(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}