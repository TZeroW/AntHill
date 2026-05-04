'use client';

import React, { useState } from 'react';
import type { Colonia } from '../../lib/types';

/**
 * ColoniaCard — tarjeta de colonia para la página Explore.
 * Reemplaza la función renderizarListaColonias() de coloniaManager.js.
 */

interface ColoniaCardProps {
  colonia: Colonia;
}

export default function ColoniaCard({ colonia }: ColoniaCardProps) {
  const getPath = (path?: string) => {
    if (!path) return '/assets/general/pfp.webp';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `/${path}`;
  };

  return (
    <div
      className="colonia-card"
      onClick={() => (window.location.href = `/?colonia=${colonia.name}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-image">
        <img src={getPath(colonia.image)} alt={colonia.name} />
      </div>
      <div className="card-content">
        <h2>c/{colonia.name}</h2>
        <p className="description">{colonia.description || 'Una comunidad de hormigas.'}</p>
        <button className="btn-join">Visitar</button>
      </div>
    </div>
  );
}
