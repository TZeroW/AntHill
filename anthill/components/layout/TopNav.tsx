import Link from 'next/link';

export default function TopNav() {
  return (
    <header className="top-nav">
      <div className="logo">
        <Link href="/" className="flex items-center gap-2">
          <img src="/assets/general/Logo-ant.png" alt="AntHill Logo" />
          <h1>AntHill</h1>
        </Link>
      </div>
      <div className="search-bar">
        <input type="text" id="global-search" placeholder="Buscar en la colonia..." />
      </div>
      <div className="user-actions">
        <div className="user-profile">
          <span id="header-user-name">Invitado</span>
          <img id="header-user-pfp" src="/assets/general/none.jpg" alt="Perfil" />
        </div>
      </div>
    </header>
  );
}
