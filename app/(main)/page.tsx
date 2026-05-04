'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/hooks/useAuth';
import { usePosts } from '../../lib/hooks/usePosts';
import CreatePostBox from '../../components/posts/CreatePostBox';
import PostFeed from '../../components/posts/PostFeed';

/**
 * Página Home — migración de posts.js + postManager.js.
 * Carga el feed general o por colonia (query param ?colonia=X).
 */
export default function Home() {
  return (
    <Suspense fallback={<p style={{ textAlign: 'center', padding: 20, color: '#666' }}>Cargando Feed...</p>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const coloniaActual = searchParams.get('colonia');
  const { user } = useAuth();
  const {
    posts,
    loading,
    error,
    cargarPosts,
    agregarPost,
    editarPost,
    eliminarPost,
    filtrarPosts,
  } = usePosts();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cargar posts al montar o cambiar de colonia
  useEffect(() => {
    cargarPosts(coloniaActual || undefined);
  }, [cargarPosts, coloniaActual]);

  // Escuchar búsqueda global del TopNav
  useEffect(() => {
    const searchInput = document.getElementById('global-search') as HTMLInputElement;
    if (!searchInput) return;

    const handler = (e: Event) => {
      setSearchQuery((e.target as HTMLInputElement).value);
    };
    searchInput.addEventListener('input', handler);
    return () => searchInput.removeEventListener('input', handler);
  }, []);

  const handlePublicar = async (contenido: string) => {
    if (!user) {
      alert('Debes iniciar sesión para publicar.');
      window.location.href = '/login';
      return;
    }

    if (editingId) {
      await editarPost(editingId, contenido);
      setEditingId(null);
      setEditingContent(null);
    } else {
      await agregarPost({
        autor: user.name,
        fotoperfil: user.pfp || 'assets/general/pfp.webp',
        contenido,
        colonia: coloniaActual || 'General',
      });
    }
  };

  const handleEdit = (id: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === id);
    if (!post || post.autor !== user.name) {
      alert('No tienes permiso para editar este post.');
      return;
    }
    setEditingId(id);
    setEditingContent(post.contenido);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const post = posts.find(p => p.id === id);
    if (!post || post.autor !== user.name) {
      alert('No tienes permiso para eliminar este post.');
      return;
    }
    if (confirm('¿Estás seguro de que quieres eliminar este post?')) {
      await eliminarPost(id);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent(null);
  };

  const displayPosts = searchQuery ? filtrarPosts(searchQuery) : posts;

  const emptyMessage = coloniaActual
    ? `La colonia c/${coloniaActual} está vacía. ¡Sé el primero en publicar!`
    : 'La colonia está vacía. ¡Sé el primero en publicar!';

  return (
    <>
      <CreatePostBox
        userPfp={user?.pfp}
        onPublicar={handlePublicar}
        editingContent={editingContent}
        isEditing={!!editingId}
        onCancelEdit={handleCancelEdit}
      />
      <PostFeed
        posts={displayPosts}
        loading={loading}
        error={error}
        emptyMessage={emptyMessage}
        currentUser={user}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  );
}
