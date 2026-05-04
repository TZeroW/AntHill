'use client';

import { useState, useCallback } from 'react';
import { postsApi } from '../api';
import type { Colonia } from '../types';

/**
 * Hook para colonias — reemplaza coloniaManager.js.
 */
export function useColonias() {
  const [colonias, setColonias] = useState<Colonia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarColonias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { colonias: data } = await postsApi.getColonias();
      setColonias(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar colonias';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const crearColonia = useCallback(async (colonia: { name: string; description?: string; image?: string }) => {
    const { colonia: nueva } = await postsApi.createColonia(colonia);
    setColonias(prev => [...prev, nueva]);
    return nueva;
  }, []);

  const filtrarColonias = useCallback((query: string) => {
    const q = query.toLowerCase();
    return colonias.filter(c => c.name.toLowerCase().includes(q));
  }, [colonias]);

  return {
    colonias,
    loading,
    error,
    cargarColonias,
    crearColonia,
    filtrarColonias,
  };
}
