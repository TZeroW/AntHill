'use client';

import React, { useState } from 'react';

/**
 * CreatePostBox — caja para crear nuevos posts.
 * Reemplaza la lógica de postManager.js (handlePublicar).
 */

interface CreatePostBoxProps {
  userPfp?: string;
  onPublicar: (contenido: string) => Promise<void>;
  editingContent?: string | null;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export default function CreatePostBox({
  userPfp,
  onPublicar,
  editingContent,
  isEditing,
  onCancelEdit,
}: CreatePostBoxProps) {
  const [contenido, setContenido] = useState(editingContent || '');
  const [submitting, setSubmitting] = useState(false);

  // Sincronizar cuando se inicia una edición
  React.useEffect(() => {
    if (editingContent !== undefined && editingContent !== null) {
      setContenido(editingContent);
    }
  }, [editingContent]);

  const handleSubmit = async () => {
    const texto = contenido.trim();
    if (!texto || submitting) return;

    setSubmitting(true);
    try {
      await onPublicar(texto);
      setContenido('');
    } catch (err) {
      console.error('Error al publicar:', err);
      alert('No se pudo crear el post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const pfpSrc = userPfp || '/assets/general/pfp.webp';

  return (
    <div className="create-post-box">
      <div className="cp-header">
        <img
          id="post-box-pfp"
          src={pfpSrc}
          alt="Profile"
          className="mini-pfp"
        />
        <input
          type="text"
          placeholder="¿Que esta pasando en la colonia?"
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {isEditing && onCancelEdit && (
          <button
            className="btn-post"
            onClick={onCancelEdit}
            style={{ background: '#333', color: '#aaa' }}
          >
            Cancelar
          </button>
        )}
        <button
          className="btn-post"
          onClick={handleSubmit}
          disabled={submitting || !contenido.trim()}
        >
          {submitting ? '...' : isEditing ? 'Guardar' : 'Publicar'}
        </button>
      </div>
    </div>
  );
}
