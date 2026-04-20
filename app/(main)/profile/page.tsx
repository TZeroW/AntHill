import React from 'react';
import '../../styles/profile.css';

export default function ProfilePage() {
  return (
    <div className="center-column w-full">
      <div className="profile-banner"></div>
      <div className="profile-header-wrapper">
        <div className="profile-header">
          <div className="profile-header-top">
            <div>
              <img
                src="/assets/general/pfp-lol.jpg"
                alt="Perfil"
                className="big-avatar"
              />
            </div>
            <div className="botones-perfil">
              {/* Usando next/link para navegación real en React */}
              <a href="/settings" className="btn btn-secondary">
                Editar perfil
              </a>
            </div>
          </div>

          <div className="user-details">
            <div className="name-badge-row">
              <h1 className="perfilNombre">Usuario</h1>
            </div>
            <p className="user-handle">@TZerp</p>
          </div>
        </div>

        <main className="feed-column">
          <div className="feed-tabs">
            <button className="feed-tab active">Publicaciones</button>
            <button className="feed-tab">Me gusta</button>
            <button className="feed-tab">Compartidos</button>
          </div>

          <div id="feed" className="posts-container">
            {/* Aquí se cargarán los posts dinámicamente con React y hooks (useState) */}
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              El feed del perfil se cargará aquí.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
