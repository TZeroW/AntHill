'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { postsApi } from '../../../../lib/api';
import { useAuth } from '../../../../lib/hooks/useAuth';
import { usePostInteractions } from '../../../../lib/hooks/usePostInteractions';
import CommentSection from '../../../../components/comments/CommentSection';
import type { Post } from '../../../../lib/types';
import '../../../styles/postView.css';

/**
 * Página de detalle del post — migración de postViewManager.js.
 * Carga un post por ID, muestra interacciones y sección de comentarios.
 */
export default function PostViewPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  const { user } = useAuth();
  const { toggleLike, toggleRepost } = usePostInteractions();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  // Estado local de contadores para actualizar sin recargar
  const [likesCount, setLikesCount] = useState(0);
  const [repostsCount, setRepostsCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!postId) {
      router.push('/');
      return;
    }

    const cargar = async () => {
      try {
        const { post: data } = await postsApi.getPostById(postId);
        setPost(data);
        setLikesCount(data.likes_count || 0);
        setRepostsCount(data.reposts_count || 0);
        setCommentsCount(data.comments_count || 0);
      } catch (err) {
        setError('Post no encontrado');
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [postId, router]);

  const getPath = (path?: string | null) => {
    if (!path) return '/assets/general/pfp.webp';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    return `/${path}`;
  };

  const handleLike = async () => {
    if (!user) {
      alert('Debes iniciar sesión para interactuar.');
      return;
    }
    try {
      const result = await toggleLike(postId, user.name);
      setLikesCount(result.count);
      setLiked(result.action === 'added');
    } catch (err) {
      console.error('Error al procesar like:', err);
    }
  };

  const handleRepost = async () => {
    if (!user) {
      alert('Debes iniciar sesión para interactuar.');
      return;
    }
    try {
      const result = await toggleRepost(postId, user.name);
      setRepostsCount(result.count);
      setReposted(result.action === 'added');
    } catch (err) {
      console.error('Error al procesar repost:', err);
    }
  };

  const handleDelete = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
      try {
        await postsApi.deletePost(postId);
        router.push('/');
      } catch (err) {
        console.error('Error al eliminar:', err);
      }
    }
  };

  if (loading) {
    return (
      <main className="post-container">
        <div className="back-button">
          <Link href="/"><i className="bi bi-arrow-left"></i> Volver</Link>
        </div>
        <article className="post-card" id="main-post-container">
          <p style={{ textAlign: 'center', padding: 20 }}>Cargando post...</p>
        </article>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="post-container">
        <div className="back-button">
          <Link href="/"><i className="bi bi-arrow-left"></i> Volver</Link>
        </div>
        <article className="post-card" id="main-post-container">
          <div style={{ textAlign: 'center', padding: 40 }}>
            <h2 style={{ color: '#666' }}>Post no encontrado</h2>
            <Link href="/">Volver al inicio</Link>
          </div>
        </article>
      </main>
    );
  }

  const isOwner = user && user.name === post.autor;
  const fecha = post.created_at ? new Date(post.created_at).toLocaleString() : 'Recién';
  const handle = `@${post.autor.toLowerCase().replace(/\s/g, '')}`;

  return (
    <main className="post-container">
      <div className="back-button">
        <Link href="/"><i className="bi bi-arrow-left"></i> Volver</Link>
      </div>

      <article className="post-card" id="main-post-container">
        <header className="post-header-full">
          <img src={getPath(post.fotoperfil)} alt={post.autor} className="author-pfp" />
          <div className="author-info">
            <div className="name-row">
              <span className="author-name">{post.autor}</span>
              <span className="user-handle">{handle}</span>
            </div>
            <span className="colony-origin">
              en <Link href={`/?colonia=${post.colonia || 'General'}`}>c/{post.colonia || 'General'}</Link>
            </span>
          </div>

          {mounted && isOwner && (
            <div className="post-options">
              <button className="options-btn" onClick={() => setMenuOpen(!menuOpen)}>
                <i className="bi bi-three-dots"></i>
              </button>
              {menuOpen && (
                <div className="kebab-menu show">
                  <button
                    className="menu-item"
                    onClick={() => {
                      setMenuOpen(false);
                      alert('Por ahora, edita tus publicaciones desde el feed principal.');
                    }}
                  >
                    <i className="bi bi-pencil-square"></i> Editar
                  </button>
                  <button className="menu-item delete" onClick={handleDelete}>
                    <i className="bi bi-trash"></i> Eliminar
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        <div className="post-body">
          <p className="post-text">{post.contenido}</p>
          {post.imagen && post.imagen !== 'placeholder' && (
            <>
              <div 
                className="media-container" 
                style={{ marginTop: 15, cursor: 'pointer' }}
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
                    style={{ width: '350px', background: '#000', borderRight: '1px solid #2f3336', display: 'flex', flexDirection: 'column', height: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ padding: '16px', borderBottom: '1px solid #2f3336', color: '#fff', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Publicación de {post.autor}</span>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFullscreenImage(false); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '20px' }}>&times;</button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                      <CommentSection postId={post.id} currentUser={user} />
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
        </div>

        <div className="post-footer">
          <span className="post-time"> {fecha}</span>
        </div>

        <footer className="post-actions-full">
          <div className="action-item like">
            <button
              onClick={handleLike}
              style={{ color: liked ? 'var(--color-primary, #ffa500)' : undefined }}
            >
              <i className={`bi ${liked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            </button>
            <span>{likesCount}</span>
          </div>
          <div className="action-item repost">
            <button
              onClick={handleRepost}
              style={{ color: reposted ? '#00ba7c' : undefined }}
            >
              <i className="bi bi-repeat"></i>
            </button>
            <span>{repostsCount}</span>
          </div>
          <div className="action-item comment">
            <button>
              <i className="bi bi-chat"></i>
            </button>
            <span>{commentsCount}</span>
          </div>
        </footer>
      </article>

      {/* Sección de Comentarios */}
      <CommentSection
        postId={postId}
        currentUser={user}
        onCommentAdded={(count) => setCommentsCount(count)}
      />
    </main>
  );
}
