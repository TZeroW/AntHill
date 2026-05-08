'use client';

import React, { useState } from 'react';

/**
 * CreatePostBox — caja para crear nuevos posts.
 * Reemplaza la lógica de postManager.js (handlePublicar).
 */

interface CreatePostBoxProps {
  userPfp?: string;
  onPublicar: (contenido: string, imagen?: string) => Promise<void>;
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
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sincronizar cuando se inicia una edición
  React.useEffect(() => {
    if (editingContent !== undefined && editingContent !== null) {
      setContenido(editingContent);
      setIsModalOpen(true);
    }
  }, [editingContent]);

  const handleSubmit = async () => {
    const texto = contenido.trim();
    const imgUrl = imageUrl.trim();
    if (!texto || submitting) return;

    setSubmitting(true);
    try {
      await onPublicar(texto, imgUrl || undefined);
      setContenido('');
      setImageUrl('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error al publicar:', err);
      alert('No se pudo crear el post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setContenido('');
    setImageUrl('');
    if (onCancelEdit) onCancelEdit();
  };

  const pfpSrc = userPfp || '/assets/general/pfp.webp';

  return (
    <>
      {/* Botón/Caja principal que abre el modal */}
      <div className="create-post-box" style={{ cursor: 'pointer' }} onClick={() => setIsModalOpen(true)}>
        <div className="cp-header" style={{ pointerEvents: 'none' }}>
          <img
            id="post-box-pfp"
            src={pfpSrc}
            alt="Profile"
            className="mini-pfp"
          />
          <input
            type="text"
            placeholder="¿Qué está pasando en la colonia?"
            readOnly
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="create-post-box" style={{ width: '90%', maxWidth: '500px', margin: 0, padding: '20px', borderRadius: '12px', background: '#000', border: '1px solid #333' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#fff', fontSize: '18px' }}>
              {isEditing ? 'Editar publicación' : 'Nueva publicación'}
            </h3>
            
            <div className="cp-header" style={{ marginBottom: '15px' }}>
              <img
                src={pfpSrc}
                alt="Profile"
                className="mini-pfp"
              />
              <textarea
                placeholder="¿Qué está pasando en la colonia?"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '16px',
                  resize: 'none',
                  outline: 'none',
                  minHeight: '80px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Enlace de la imagen (opcional)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={{ width: '100%', background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '12px', color: '#fff', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                className="btn-post"
                onClick={handleCancel}
                style={{ background: '#222', color: '#ccc', padding: '8px 16px' }}
              >
                Cancelar
              </button>
              <button
                className="btn-post"
                onClick={handleSubmit}
                disabled={submitting || !contenido.trim()}
                style={{ padding: '8px 24px' }}
              >
                {submitting ? 'Guardando...' : isEditing ? 'Guardar' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
