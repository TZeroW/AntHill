'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { postsApi } from '../../lib/api';
import type { Comment } from '../../lib/types';

/**
 * CommentList + CommentInput — reemplaza la sección de comentarios de postViewManager.js.
 */

interface CommentSectionProps {
  postId: string;
  currentUser?: { name: string; pfp?: string } | null;
  onCommentAdded?: (newCount: number) => void;
}

export default function CommentSection({ postId, currentUser, onCommentAdded }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cargarComentarios = useCallback(async () => {
    try {
      const { comments: data } = await postsApi.getComments(postId);
      setComments(data);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    cargarComentarios();
  }, [cargarComentarios]);

  const handleSubmit = async () => {
    const contenido = texto.trim();
    if (!contenido || !currentUser || submitting) return;

    setSubmitting(true);
    try {
      const { comment, comments_count } = await postsApi.createComment(postId, {
        autor: currentUser.name,
        fotoperfil: currentUser.pfp || 'assets/general/pfp.webp',
        contenido,
      });
      setComments(prev => [...prev, comment]);
      setTexto('');
      onCommentAdded?.(comments_count);
    } catch (err) {
      console.error('Error al comentar:', err);
      alert('Error al enviar comentario.');
    } finally {
      setSubmitting(false);
    }
  };

  const getPath = (path?: string) => {
    if (!path) return '/assets/general/pfp.webp';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `/${path}`;
  };

  return (
    <section className="comments-section" style={{ display: 'block' }}>
      {/* Input para comentar */}
      <div className="comment-input-box">
        <img
          src={getPath(currentUser?.pfp)}
          alt="Your PFP"
          className="mini-pfp"
        />
        <div className="input-wrapper">
          <textarea
            placeholder={currentUser ? 'Escribe tu comentario...' : 'Inicia sesión para comentar'}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            disabled={!currentUser}
          />
          <div className="input-actions">
            <button
              className="btn-comment-submit"
              onClick={handleSubmit}
              disabled={submitting || !texto.trim() || !currentUser}
            >
              {submitting ? '...' : 'Responder'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de comentarios */}
      <div className="comments-list">
        {loading && (
          <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>
            Cargando comentarios...
          </p>
        )}

        {!loading && comments.length === 0 && (
          <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center', marginTop: 20 }}>
            Sé el primero en comentar esta hormigada.
          </p>
        )}

        {comments.map((c) => (
          <div
            key={c.id}
            className="comment-item"
            style={{ display: 'flex', gap: 12, padding: '15px 0', borderBottom: '1px solid #222' }}
          >
            <img
              src={getPath(c.fotoperfil)}
              alt={c.autor}
              className="mini-pfp"
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div className="comment-content" style={{ flex: 1 }}>
              <div
                className="comment-header"
                style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}
              >
                <span style={{ fontWeight: 'bold', color: 'white', fontSize: '0.9rem' }}>
                  {c.autor}
                </span>
                <span style={{ color: '#666', fontSize: '0.8rem' }}>
                  • {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ color: '#e1e1e1', fontSize: '0.95rem', lineHeight: 1.4, margin: 0 }}>
                {c.contenido}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
