'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/hooks/useAuth';
import '../../styles/settings.css';

/**
 * Settings page — migración de settingsManager.js.
 */
export default function SettingsPage() {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [pfpUrl, setPfpUrl] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.name || '');
      setPfpUrl(user.pfp || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setBirthdate(user.birthdate || '');
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = '/login';
    }
  }, [authLoading, user]);

  const getPath = (path?: string) => {
    if (!path) return '/assets/general/pfp.webp';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `/${path}`;
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setMessage({ text: 'El nombre no puede estar vacío.', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: username, pfp: pfpUrl, bio, location, birthdate });
      setMessage({ text: '¡Perfil actualizado!', type: 'success' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="settings-box">
      <h2>Personalizar Perfil</h2>
      <p className="settings-desc">Cambia tu apariencia en la colonia.</p>
      <div className="settings-form">
        <div className="form-group">
          <label>Nombre de Usuario</label>
          <input className="user-name" type="text" id="username-input" placeholder="Tu nuevo nombre" value={username} onChange={(e) => setUsername(e.target.value)} />
          <small>Este nombre aparecerá en tus posts y perfil.</small>
        </div>
        <div className="form-group">
          <label>Foto de Perfil (URL)</label>
          <div className="pfp-preview-container">
            <img id="pfp-preview" src={getPath(pfpUrl)} alt="Vista previa" />
            <input type="text" id="pfp-url-input" placeholder="https://ejemplo.com/mi-foto.jpg" value={pfpUrl} onChange={(e) => setPfpUrl(e.target.value)} />
          </div>
          <small>Pega la URL de una imagen para actualizar tu avatar.</small>
        </div>
        <div className="form-group">
          <label>Cual es tu biografia?</label>
          <textarea id="bio-input" placeholder="Escribe algo sobre ti..." className="text-bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>
        <div className="text-data">
          <div className="form-group text-location">
            <label>Ubicación</label>
            <input type="text" id="location-input" placeholder="Ej: CDMX, México" className="text-n" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div className="form-group text-year">
            <label>Fecha de Nacimiento</label>
            <input type="date" id="birthdate-input" className="text-year" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
          </div>
        </div>
        <button id="btn-save-settings" className="btn-post" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
        {message && (
          <div id="settings-message" className={message.type} style={{ display: 'block' }}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
