'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Post } from '../../lib/types';
import PostActions from './PostActions';

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
  const isOwner = currentUser && currentUser.name === post.autor;

  const getPath = (path?: string | null) => {
    if (!path) return '/assets/general/pfp.webp';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `/${path}`;
  };

  const fecha = post.created_at
    ? new Date(post.created_at).toLocaleDateString()
    : 'Recién';

  return (
    <article className="post-item" data-id={post.id}>
      <Link href={`/post/${post.id}`} className="post-link-wrapper" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', width: '100%' }}>
        <div className="post-pfp-col">
          <img src={getPath(post.fotoperfil)} alt={post.autor} className="post-pfp-img" />
        </div>
        <div className="post-main-col">
          <div className="post-hdr">
            <span className="post-author">{post.autor}</span>
            <span className="post-date">· {fecha}</span>

            {isOwner && (
              <div className="post-options" onClick={(e) => e.preventDefault()}>
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
              <div className="media-container" style={{ marginTop: 10 }}>
                <img
                  src={getPath(post.imagen)}
                  alt="Imagen del Post"
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #222' }}
                />
              </div>
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

          <div className="post-footer" onClick={(e) => e.preventDefault()}>
            <PostActions post={post} currentUser={currentUser} />
          </div>
        </div>
      </Link>
    </article>
  );
}
