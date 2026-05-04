'use client';

import React, { useState } from 'react';

/**
 * CreateColoniaModal — modal para fundar nueva colonia.
 * Reemplaza la lógica del modal de coloniaManager.js.
 */

interface CreateColoniaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (colonia: { name: string; description?: string; image?: string }) => Promise<void>;
}

export default function CreateColoniaModal({ isOpen, onClose, onConfirm }: CreateColoniaModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!name.trim()) {
      setError('La colonia necesita un nombre.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onConfirm({
        name: name.trim(),
        description: description.trim() || undefined,
        image: image.trim() || undefined,
      });
      // Limpiar y cerrar
      setName('');
      setDescription('');
      setImage('');
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al fundar colonia';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ display: 'flex' }}>
      <div className="modal-content">
        <h2 className="modal-title">Fundar Nueva Colonia</h2>
        <div className="modal-body">
          <input
            type="text"
            className="modal-input"
            placeholder="Nombre de la colonia (ej. Gaming)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="modal-textarea"
            placeholder="Descripción breve..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="text"
            className="modal-input"
            placeholder="URL de la imagen (opcional)"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? 'Fundando...' : 'Fundar'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
          </div>
        </div>
        {error && (
          <p className="error-message" style={{ display: 'block' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
