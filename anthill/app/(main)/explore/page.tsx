import React from 'react';
import '../../styles/colonias.css';

export default function ExplorePage() {
  return (
    <>
      <main className="colonias-container" style={{ width: '100%' }}>
        <div className="colonias-header" id="colonias-list">
          <p>Las colonias se cargarán aquí con React...</p>
        </div>
      </main>

      {/* Esqueleto del Menú para Crear Colonia */}
      <div id="modal-crear-colonia" className="modal-overlay" style={{ display: 'none' }}>
        <div className="modal-content">
          <h2 className="modal-title">Fundar Nueva Colonia</h2>
          <div className="modal-body">
            <input
              type="text"
              id="new-colonia-name"
              className="modal-input"
              placeholder="Nombre de la colonia (ej. Gaming)"
            />
            <textarea
              id="new-colonia-desc"
              className="modal-textarea"
              placeholder="Descripción breve..."
            />
            <input
              type="text"
              id="new-colonia-img"
              className="modal-input"
              placeholder="URL de la imagen (opcional)"
            />
            <div className="modal-actions">
              <button id="btn-confirm-colonia" className="btn btn-primary">
                Fundar
              </button>
              <button id="btn-cancel-colonia" className="btn btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
          <p id="colonia-error-msg" className="error-message"></p>
        </div>
      </div>
    </>
  );
}
