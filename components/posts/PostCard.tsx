'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Post } from '../../lib/types';
import PostActions from '../posts/PostActions';
import CommentSection from '../comments/CommentSection';

/**
 * Componente PostCard — reemplaza la función crearPost() de cajaPost.js.
 * Renderiza un post individual en el feed.
 */

interface PostCardProps {
  post: Post;
  currentUser?: { name: string } | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function PostCard({ post, currentUser, onEdit, onDelete }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOwner = currentUser && currentUser.name === post.autor;

  const getPath = (path?: string | null) => {
    if (!path) return '/assets/general/pfp.webp';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `/${path}`;
  };

  const fecha = mounted && post.created_at
    ? new Date(post.created_at).toLocaleDateString()
    : '';

  const handleCardClick = (e: React.MouseEvent) => {
    // Navigate only if the click was not on an interactive element
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('.media-container') || target.closest('.kebab-menu')) {
      return;
    }
    router.push(`/post/${post.id}`);
  };

  return (
    <article className="post-item" data-id={post.id} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="post-link-wrapper" style={{ display: 'flex', width: '100%' }}>
        <div className="post-pfp-col">
          <img src={getPath(post.fotoperfil)} alt={post.autor} className="post-pfp-img" />
        </div>
        <div className="post-main-col">
          <div className="post-hdr">
            <span className="post-author">{post.autor}</span>
            <span className="post-date">· {fecha}</span>

            {mounted && isOwner && (
              <div className="post-options">
                <button
                  className="kebab-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                  }}
                >
                  <i className="bi bi-three-dots-vertical"></i>
                </button>
                {menuOpen && (
                  <div className="kebab-menu show">
                    <button
                      className="menu-item"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit?.(post.id);
                      }}
                    >
                      <i className="bi bi-pencil-square"></i> Editar
                    </button>
                    <button
                      className="menu-item delete"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete?.(post.id);
                      }}
                    >
                      <i className="bi bi-trash3"></i> Eliminar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="post-body">
            <p className="post-text">{post.contenido}</p>
            {post.imagen && post.imagen !== 'placeholder' && (
              <>
                <div 
                  className="media-container" 
                  style={{ marginTop: 12, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setFullscreenImage(true);
                  }}
                >
                  <img
                    src={getPath(post.imagen)}
                    alt="Imagen del Post"
                    style={{ 
                      width: '100%', 
                      maxHeight: '512px', 
                      objectFit: 'cover', 
                      borderRadius: '16px', 
                      border: '1px solid #2f3336' 
                    }}
                  />
                </div>

                {fullscreenImage && (
                  <div 
                    style={{
                      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 99999, display: 'flex'
                    }}
                  >
                    {/* Panel izquierdo: Comentarios */}
                    <div 
                      style={{ width: '350px', background: '#000', borderRight: '1px solid #2f3336', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'default' }}
                      onClick={(e) => e.stopPropagation()} // Prevenir cerrar al clickear panel
                    >
                      <div style={{ padding: '16px', borderBottom: '1px solid #2f3336', color: '#fff', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Publicación de {post.autor}</span>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFullscreenImage(false); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
                      </div>
                      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                        <CommentSection postId={post.id} currentUser={currentUser} />
                      </div>
                    </div>

                    {/* Panel derecho: Imagen */}
                    <div 
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', position: 'relative' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFullscreenImage(false);
                      }}
                    >
                      <img
                        src={getPath(post.imagen)}
                        alt="Imagen completa"
                        style={{ maxWidth: '95%', maxHeight: '95vh', objectFit: 'contain', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            {post.imagen === 'placeholder' && (
              <div
                className="mock-media"
                style={{
                  width: '100%',
                  height: 200,
                  background: 'linear-gradient(135deg, #161616 0%, #0d0d0d 100%)',
                  borderRadius: 8,
                  marginTop: 10,
                  border: '1px solid #222',
                }}
              />
            )}
          </div>

          <div className="post-footer">
            <PostActions post={post} currentUser={currentUser} />
          </div>
        </div>
      </div>
    </article>
  );
}
