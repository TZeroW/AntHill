import React from 'react';
import '../../styles/settings.css';

export default function SettingsPage() {
  return (
    <div className="settings-box">
      <h2>Personalizar Perfil</h2>
      <p className="settings-desc">Cambia tu apariencia en la colonia.</p>

      <div className="settings-form">
        <div className="form-group">
          <label>Nombre de Usuario</label>
          <input
            className="user-name"
            type="text"
            id="username-input"
            placeholder="Tu nuevo nombre"
          />
          <small>Este nombre aparecerá en tus posts y perfil.</small>
        </div>

        <div className="form-group">
          <label>Foto de Perfil (URL)</label>
          <div className="pfp-preview-container">
            <img id="pfp-preview" src="/assets/general/pfp.webp" alt="Vista previa" />
            <input
              type="text"
              id="pfp-url-input"
              placeholder="https://ejemplo.com/mi-foto.jpg"
            />
          </div>
          <small>Pega la URL de una imagen para actualizar tu avatar.</small>
        </div>

        <div className="form-group">
          <label>Cual es tu biografia?</label>
          <textarea
            id="bio-input"
            placeholder="Escribe algo sobre ti..."
            className="text-bio"
          ></textarea>
        </div>

        <div className="text-data">
          <div className="form-group text-location">
            <label>Ubicación</label>
            <input
              type="text"
              id="location-input"
              placeholder="Ej: CDMX, México"
              className="text-n"
            />
          </div>
          <div className="form-group text-year">
            <label>Fecha de Nacimiento</label>
            <input type="date" id="birthdate-input" className="text-year" />
          </div>
        </div>

        <button id="btn-save-settings" className="btn-post">
          Guardar Cambios
        </button>
        <div id="settings-message"></div>
      </div>
    </div>
  );
}
