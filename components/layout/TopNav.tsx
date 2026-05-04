'use client';

import Link from 'next/link';
import { useAuth } from '../../lib/hooks/useAuth';

/**
 * TopNav — header con búsqueda y perfil de usuario dinámico.
 */
export default function TopNav() {
  const { user } = useAuth();

  const getPath = (path?: string) => {
    if (!path) return '/assets/general/none.jpg';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `/${path}`;
  };

  return (
    <header className="top-nav">
      <div className="logo d-flex align-items-center" style={{ display: 'flex', alignItems: 'center' }}>
        <Link href="/" className="logo-link" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <img src="/assets/general/Logo-ant.png" alt="AntHill Logo" />
          <h1>AntHill</h1>
        </Link>
      </div>
      <div className="search-bar">
        <input type="text" id="global-search" placeholder="Buscar en la colonia..." />
      </div>
      <div className="user-actions">
        <div className="user-profile">
          <span id="header-user-name">{user?.name || 'Invitado'}</span>
          <img id="header-user-pfp" src={getPath(user?.pfp)} alt="Perfil" />
        </div>
      </div>
    </header>
  );
}
