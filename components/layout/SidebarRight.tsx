import Link from 'next/link';

export default function SidebarRight() {
  return (
    <aside className="sidebar-right">
      <div className="widget recommended-widget">
        <h3>Colonias Recomendadas</h3>
        <div id="recommended-list">
          <p style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', padding: '10px' }}>
            Cargando colonias...
          </p>
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
