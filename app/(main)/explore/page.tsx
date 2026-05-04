'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';
import { useColonias } from '../../../lib/hooks/useColonias';
import ColoniaCard from '../../../components/colonias/ColoniaCard';
import CreateColoniaModal from '../../../components/colonias/CreateColoniaModal';
import '../../styles/colonias.css';

/**
 * Explore page — migración de coloniaManager.js.
 */
export default function ExplorePage() {
  const { user } = useAuth();
  const { colonias, loading, error, cargarColonias, crearColonia, filtrarColonias } = useColonias();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    cargarColonias();
  }, [cargarColonias]);

  // Escuchar búsqueda global
  useEffect(() => {
    const searchInput = document.getElementById('global-search') as HTMLInputElement;
    if (!searchInput) return;
    const handler = (e: Event) => setSearchQuery((e.target as HTMLInputElement).value);
    searchInput.addEventListener('input', handler);
    return () => searchInput.removeEventListener('input', handler);
  }, []);

  const displayColonias = searchQuery ? filtrarColonias(searchQuery) : colonias;

  return (
    <>
      <main className="colonias-container" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Explorar Colonias</h2>
          {user && (
            <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
              + Fundar Colonia
            </button>
          )}
        </div>

        <div className="colonias-header" id="colonias-list">
          {loading && <p>Cargando colonias...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && displayColonias.length === 0 && <p>No se encontraron colonias.</p>}
          {displayColonias.map((col) => (
            <ColoniaCard key={col.id} colonia={col} />
          ))}
        </div>
      </main>

      <CreateColoniaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={async (data) => {
          await crearColonia(data);
        }}
      />
    </>
  );
}
