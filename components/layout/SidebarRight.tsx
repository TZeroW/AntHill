'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useColonias } from '../../lib/hooks/useColonias';

/**
 * SidebarRight — widget de colonias recomendadas (dinámico).
 * Reemplaza cargarRecomendados() de coloniaManager.js.
 */
export default function SidebarRight() {
  const { colonias, cargarColonias } = useColonias();

  useEffect(() => {
    cargarColonias();
  }, [cargarColonias]);

  const recomendadas = colonias.slice(0, 3);

  const getPath = (path?: string) => {
    if (!path) return '/assets/general/Logo-ant.png';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `/${path}`;
  };

  return (
    <aside className="sidebar-right">
      <div className="widget recommended-widget">
        <h3>Colonias Recomendadas</h3>
        <div id="recommended-list">
          {recomendadas.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', padding: 10 }}>
              No hay colonias todavía.
            </p>
          ) : (
            recomendadas.map((col) => (
              <div
                key={col.id}
                className="colony-item"
                style={{ cursor: 'pointer' }}
                onClick={() => (window.location.href = `/?colonia=${col.name}`)}
              >
                <div className="colony-info">
                  <img
                    src={getPath(col.image)}
                    className="colony-icon"
                    style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
                    alt={col.name}
                  />
                  <div>
                    <strong>c/{col.name}</strong>
                    <span>Miembro de la colonia</span>
                  </div>
                </div>
                <button className="btn-join-text">Visitar</button>
              </div>
            ))
          )}
        </div>
        <Link href="/explore">
          <div className="show-more" style={{ cursor: 'pointer' }}>
            Ver todas
          </div>
        </Link>
      </div>

      <div className="footer-links">
        <a href="#">Privacidad</a> · <a href="#">Terminos</a> ·{' '}
        <a href="#">Anuncios</a> · <span>© 2026 AntHill</span>
      </div>
    </aside>
  );
}
