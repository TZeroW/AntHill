'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';
import type { User } from '../types';

const STORAGE_KEY = 'anthill_user';

/**
 * Hook de autenticación — reemplaza el patrón localStorage manual de los scripts.
 * Mantiene compatibilidad con la key 'anthill_user' de localStorage.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario de localStorage al montar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (name: string, password: string) => {
    const { user: loggedUser } = await authApi.login(name, password);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedUser));
    setUser(loggedUser);
    return loggedUser;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, gender: string) => {
    await authApi.register(name, email, password, gender);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) throw new Error('No hay sesión activa');
    const { user: updatedUser } = await authApi.updateProfile(user.id, updates);
    // Actualizar localStorage y estado
    const merged = { ...user, ...updatedUser };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    setUser(merged);
    return merged;
  }, [user]);

  return {
    user,
    loading,
    isLoggedIn: !!user,
    login,
    register,
    logout,
    updateProfile,
  };
}
